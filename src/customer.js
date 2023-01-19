const express = require("express");
const { RPCObserver, RPCRequest } = require("./rpc");
const PORT = 9000;

const app = express();
app.use(express.json());

const fakeCustomerResponse = {
    _id: "asdase23rf43223sa",
    name: "Faraz",
    country: "Pakistan"
};

RPCObserver("CUSTOMER_RPC", fakeCustomerResponse)

app.get("/wishlist", async (req, res) => {
    try {
        const requestPayload = {
            productId: "123",
            customerId: "asdase23rf43223sa"
        }
        const responseData = await RPCRequest("PRODUCT_RPC", requestPayload)
        // console.log("responseData :: ", responseData)
        return res.status(200).json({ response: responseData })
    } catch (e) {
        console.log("Error :: ", e)
        return res.status(400).json({ error: "Some error occured." })
    }

});

app.get("/", (req, res) => {
    return res.json({ message: "Customer Service" })
});

app.listen(PORT, () => {
    console.log(`Customer is Running on ${PORT}`);
    console.clear();
})