const amqplib = require("amqplib");
const { v4: uuid4 } = require("uuid");

let amqplibConnection = null;

const getChannel = async () => {
    if (amqplibConnection === null) {
        amqplibConnection = await amqplib.connect("amqp://localhost");
    }

    return await amqplibConnection.createChannel();
};

const expensiveDBOperation = (payload, fakeResponse) => {

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(fakeResponse)
        }, 3000)
    })
}

const RPCObserver = async (RPC_QUEUE_NAME, fakeResponse) => {
    const channel = await getChannel();

    await channel.assertQueue(RPC_QUEUE_NAME, {
        durable: false
    });
    channel.prefetch(1);
    channel.consume(
        RPC_QUEUE_NAME,
        async (msg) => {
            if (msg.content) {
                // DB Operation
                const payload = JSON.parse(msg.content.toString());
                const response = await expensiveDBOperation(payload, fakeResponse); // call fake db operation
                channel.sendToQueue(
                    msg.properties.replyTo,
                    Buffer.from(JSON.stringify(response)),
                    {
                        correlationId: msg.properties.correlationId
                    }
                )
                channel.ack(msg);
            }
        }, {
        noAct: false
    }
    )
};

const requestData = async (RPC_QUEUE_NAME, payload, uuid) => {
    const channel = await getChannel();
    const q = await channel.assertQueue("", { exclusive: true });

    channel.sendToQueue(RPC_QUEUE_NAME, Buffer.from(JSON.stringify(payload)), {
        replyTo: q.queue,
        correlationId: uuid
    })

    return new Promise((resolve, reject) => {
        const time = setTimeout(() => {
            channel.close();
            resolve("API could not fulfit the request.")
        }, 8000)
        channel.consume(q.queue, (msg) => {
            if (msg.properties.correlationId === uuid) {
                clearTimeout(time)
                resolve(JSON.parse(msg.content.toString()))
            } else {
                clearTimeout(time)
                reject("Data not found.")
            }
        }, {
            noAct: true
        })
    })
}

const RPCRequest = async (RPC_QUEUE_NAME, requestPayload) => {
    const uuid = uuid4() // corelationId

    return await requestData(RPC_QUEUE_NAME, requestPayload, uuid)
};

module.exports = {
    getChannel,
    RPCObserver,
    RPCRequest
}