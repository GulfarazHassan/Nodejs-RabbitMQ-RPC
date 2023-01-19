const express = require("express");
const { RPCObserver, RPCRequest } = require("./rpc");
const PORT = 8000;

const app = express();
app.use(express.json());

const fakePRODUCTResponse = {
    _id: "asdase23rf432asd23sa",
    title: "Mango",
    price: 600
};

RPCObserver("PRODUCT_RPC", fakePRODUCTResponse)

app.get("/customer", async (req, res) => {
    try {
        const requestPayload = {
            customerId: "asdase23rf43223sa"
        }
        const responseData = await RPCRequest("CUSTOMER_RPC", requestPayload)
        // console.log("responseData /customer :: ", responseData)
        return res.status(200).json({ response: responseData })
    } catch (e) {
        console.log("Error :: ", e)
        return res.status(400).json({ error: "Some error occured." })
    }
});

app.get("/", (req, res) => {
    return res.json({ message: "PRODUCTS Service" })
});

app.listen(PORT, () => {
    console.log(`PRODUCTS is Running on ${PORT}`);
    console.clear();
})