document.addEventListener("DOMContentLoaded", () => {
    loadQuestion();
    loadConfig();

    document.getElementById("configForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const data = [];
        for (let i = 1; i <= 10; i++) {
            const pInput = document.getElementById(`pachinko_${i}`);
            const mInput = document.getElementById(`medal_${i}`);
            if (pInput && mInput) {
                data.push({ number: i, type: "pachinko", amount: parseInt(pInput.value) || 0 });
                data.push({ number: i, type: "medal", amount: parseInt(mInput.value) || 0 });
            }
        }

        fetch("/save_config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        }).then(() => loadConfig());
    });

    document.getElementById("drinkBtn").addEventListener("click", () => {
    if (
        (currentQuestion.type === "pachinko" && currentQuestion.value >= 35) ||
        (currentQuestion.type === "medal" && currentQuestion.value >= 7)
    ) {
        document.getElementById("result").textContent = "🥤 ドリンク交換が可能です！";
    } else {
        document.getElementById("result").textContent = "❌ ドリンク交換できません。";
    }
});

});

function loadQuestion() {
    fetch("/get_question")
        .then(res => res.json())
        .then(data => {
            document.getElementById("question").textContent = `${data.value}${data.type === "pachinko" ? "玉" : "枚"}`;
            currentQuestion = data;
            loadButtons(data);
        });
}

function loadButtons(data) {
    fetch("/get_config")
        .then(res => res.json())
        .then(config => {
            const buttonsDiv = document.getElementById("buttons");
            buttonsDiv.innerHTML = "";

            const filtered = config.filter(c => c.type === data.type);
            const validOptions = filtered.filter(c => c.amount <= data.value);
            const maxOption = validOptions.reduce((max, item) => item.amount > max.amount ? item : max, { amount: -1 });

            for (let i = 1; i <= 10; i++) {
                const option = filtered.find(c => c.number === i);
                if (!option) continue;

                const btn = document.createElement("button");
                btn.textContent = `${i}番`;
                btn.onclick = () => {
                    if (option.number === maxOption.number) {
                        document.getElementById("result").textContent = "⭕ 正解！";
                    } else {
                        document.getElementById("result").textContent = "❌ 不正解...";
                    }
                };
                buttonsDiv.appendChild(btn);
            }
        });
}

function loadConfig() {
    fetch("/get_config")
        .then(res => res.json())
        .then(config => {
            const table = document.getElementById("configTable");
            table.innerHTML = "";
            for (let i = 1; i <= 10; i++) {
                const row = document.createElement("tr");
                const pConfig = config.find(c => c.number === i && c.type === "pachinko");
                const mConfig = config.find(c => c.number === i && c.type === "medal");

                row.innerHTML = `
                    <td>${i}</td>
                    <td><input id="pachinko_${i}" type="number" value="${pConfig ? pConfig.amount : 0}"></td>
                    <td><input id="medal_${i}" type="number" value="${mConfig ? mConfig.amount : 0}"></td>
                    <td>玉/枚</td>
                `;
                table.appendChild(row);
            }
        });
}
