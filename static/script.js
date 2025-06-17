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

                    // 最適な正解（最大値）を選ぶ
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
