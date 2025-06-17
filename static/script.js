function loadQuestion() {
    fetch("/get_question")
        .then(response => response.json())
        .then(data => {
            const questionDiv = document.getElementById("question");
            const buttonsDiv = document.getElementById("buttons");
            const resultDiv = document.getElementById("result");
            const drinkBtn = document.getElementById("drinkBtn");

            buttonsDiv.innerHTML = "";
            resultDiv.innerHTML = "";

            const unit = data.type === "pachinko" ? "玉" : "枚";
            questionDiv.textContent = `${data.value} ${unit}`;

            fetch("/get_config")
                .then(res => res.json())
                .then(config => {
                    const targetList = config.filter(item => item.type === data.type);
                    const validOptions = targetList.filter(item => item.amount <= data.value);

                    // 最適な正解（最大交換数の番号）
                    let correct = null;
                    if (validOptions.length > 0) {
                        correct = validOptions.reduce((a, b) => a.amount > b.amount ? a : b);
                    }

                    for (const item of targetList) {
                        const btn = document.createElement("button");
                        btn.textContent = `${item.number} 番`;
                        btn.onclick = () => {
                            if (correct && item.number === correct.number) {
                                resultDiv.textContent = "⭕ 正解！";
                            } else {
                                resultDiv.textContent = "❌ 不正解…";
                            }
                        };
                        buttonsDiv.appendChild(btn);
                    }

                    drinkBtn.onclick = () => {
                        if (data.type === "pachinko" && data.value >= 35) {
                            resultDiv.textContent = "🥤 ドリンク交換OK";
                        } else {
                            resultDiv.textContent = "❌ ドリンク交換できません";
                        }
                    };
                });
        });
}

window.onload = () => {
    loadQuestion();

    const form = document.getElementById("configForm");
    form.onsubmit = (e) => {
        e.preventDefault();
        const table = document.getElementById("configTable");
        const rows = table.querySelectorAll("tr");
        const newConfig = [];

        rows.forEach(row => {
            const number = parseInt(row.dataset.number);
            const type = row.dataset.type;
            const input = row.querySelector("input");
            const amount = parseInt(input.value);
            newConfig.push({ number, type, amount });
        });

        fetch("/save_config", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newConfig)
        })
        .then(res => res.json())
        .then(data => {
            alert("保存しました！");
        });
    };

    fetch("/get_config")
        .then(res => res.json())
        .then(config => {
            const table = document.getElementById("configTable");
            table.innerHTML = "";

            config.forEach(item => {
                const tr = document.createElement("tr");
                tr.dataset.number = item.number;
                tr.dataset.type = item.type;

                const tdNumber = document.createElement("td");
                tdNumber.textContent = item.number;

                const tdAmount = document.createElement("td");
                const input = document.createElement("input");
                input.type = "number";
                input.value = item.amount;
                tdAmount.appendChild(input);

                const tdEmpty = document.createElement("td");
                tdEmpty.textContent = item.type === "pachinko" ? "玉" : "枚";

                tr.appendChild(tdNumber);
                tr.appendChild(tdAmount);
                tr.appendChild(tdEmpty);
                table.appendChild(tr);
            });
        });
};
