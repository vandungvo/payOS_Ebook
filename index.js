const express = require('express');
const PayOS = require('@payos/node');
const fs = require('fs').promises;

const payos = new PayOS(
    '7e0f3227-2e12-46bb-bb7f-a13c913e403c',
    '999bf77a-be2f-478a-80ba-d8f683b7f01d',
    '02ca4bb742ba173ae3060860d3bb49312bb10cd4cac1f78f8e6f25fbcd6db0df'
);
const app = express();
app.use(express.json());

const YOUR_DOMAIN = 'https://pay-os-ebook.vercel.app';
let ordercode = 0;

async function readOrderCode() {
    try {
        const data = await fs.readFile('public/orderCode.txt', 'utf8');
        ordercode = parseInt(data);
    } catch (err) {
        console.error("Error reading orderCode:", err);
    }
}

async function writeOrderCode() {
    try {
        await fs.writeFile('public/orderCode.txt', ordercode.toString());
    } catch (err) {
        console.error("Error writing orderCode:", err);
    }
}

readOrderCode();

console.log('orderCode:', ordercode);

app.post('/create-payment-link', async (req, res) => {
    const order = {
        amount: 10000,
        description: 'Thanh toan sach',
        orderCode: ordercode,
        returnUrl: `${YOUR_DOMAIN}/success.html`,
        cancelUrl: `${YOUR_DOMAIN}/cancel.html`
    }
    const paymentLink = await payos.createPaymentLink(order);
    ordercode++;
    await writeOrderCode();
    res.redirect(303, paymentLink.checkoutUrl);
});

// https://f8b8-14-230-156-135.ngrok-free.app/receive-hook
app.post('/receive-hook', async(req, res) => {
    console.log(req.body);
    res.json();
});

// Listen on the appropriate port for Vercel deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
