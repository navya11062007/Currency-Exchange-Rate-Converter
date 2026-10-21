
const amountInput = document.getElementById("amount");
const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const convertButton = document.getElementById("convertButton");
const swapButton = document.getElementById("swapButton");
const result = document.getElementById("result");
const rateText = document.getElementById("rate");
const updatedText = document.getElementById("updated");
const message = document.getElementById("message");

async function convertCurrency() {
    const amount = Number(amountInput.value);
    const from = fromCurrency.value;
    const to = toCurrency.value;

    message.textContent = "";
    updatedText.textContent = "";

    if (amountInput.value.trim() === "" ||
        !Number.isFinite(amount) || amount <= 0) {
        result.textContent = "Enter a valid amount";
        rateText.textContent = "";
        message.textContent = "Please enter an amount greater than zero.";
        return;
    }

    convertButton.disabled = true;
    convertButton.textContent = "Converting...";
    result.textContent = "Loading exchange rate...";
    rateText.textContent = "";

    try {
        let exchangeRate;
        let rateDate = "";

        if (from === to) {
            exchangeRate = 1;
        } else {
            const url =
                `https://api.frankfurter.dev/v1/latest?base=${from}&symbols=${to}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Exchange rate service is unavailable.");
            }

            const data = await response.json();
            exchangeRate = data.rates[to];
            rateDate = data.date || "";
        }

        if (!Number.isFinite(exchangeRate) || exchangeRate <= 0) {
            throw new Error("Exchange rate could not be found.");
        }

        const convertedAmount = amount * exchangeRate;

        const formattedAmount = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: to,
            maximumFractionDigits: 2
        }).format(convertedAmount);

        result.textContent = formattedAmount;

        rateText.textContent =
            `1 ${from} = ${exchangeRate.toFixed(4)} ${to}`;

        if (rateDate) {
            updatedText.textContent =
                `Rate date: ${rateDate}`;
        } else {
            updatedText.textContent =
                "Same currency selected; no conversion needed.";
        }

    } catch (error) {
        result.textContent = "Conversion unavailable";
        rateText.textContent = "";
        message.textContent =
            "Could not fetch the exchange rate. Check your internet and try again.";
        console.error(error);
    } finally {
        convertButton.disabled = false;
        convertButton.textContent = "Convert Currency";
    }
}

swapButton.addEventListener("click", () => {
    const previousFrom = fromCurrency.value;

    fromCurrency.value = toCurrency.value;
    toCurrency.value = previousFrom;

    convertCurrency();
});

convertButton.addEventListener("click", convertCurrency);

amountInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        convertCurrency();
    }
});

fromCurrency.addEventListener("change", convertCurrency);
toCurrency.addEventListener("change", convertCurrency);

// Display an initial conversion when the page opens.
convertCurrency();