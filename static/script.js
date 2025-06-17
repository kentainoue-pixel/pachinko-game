let currentQuestion = null;
let config = null;

async function loadQuestion() {
    const res = await fetch("/get_question");
    currentQuestion = await res.json();
    document.getElementById("result").innerText = "";
    renderQuestion();
}

async function loadConfig() {
    const res = await fetch("/get_config");
    config = await res.json();
    renderConfigTable();
}

function renderQuestion() {
    const q = currentQuestion;
    document.getElementById("question").innerText = `${q.value}${q.type === "pachinko" ? "玉" : "枚"}`;
    const btns = document.getElementById("buttons");
    btns.innerHTML = "";

    for (let prize of config.prizes) {
        const btn = document.createElement("button");
        btn.innerText = `${prize.number}番`;
        btn.onclick = () => checkAnswer(prize.number);
        btns.appendChild(btn);
    }

    const drinkBtn = document.getElementById("drinkBtn");
    drinkBtn.disabled = !(q.type === "pachinko" && q.value >= config.drink.pachinko);
}

function checkAnswer(selected) {
    const { type, value } = currentQuestion;
    let max = 0;

    for (let prize of config.prizes) {
        const cost = type === "pachinko" ? prize.pachinko : prize.medal;
        if (value >= cost) {
            max = prize.number;
        } else {
            break;
        }
    }

    const result = document.getElementById("result");
    if (selected <= max) {
        result.innerText = "✅ 正解！";
    } else {
        result.innerText = `❌ 不正解。案内できるのは ${max}番までです。`;
    }
}

function renderConfigTable() {
    const tbody = document.getElementById("configTable");
    tbody.innerHTML = "";
    for (let prize of config.prizes) {
        tbody.innerHTML += `
            <tr>
                <td>${prize.number}</td>
                <td><input type="number" name="pachinko_${prize.number}" value="${prize.pachinko}" min="0"></td>
                <td><input type="number" name="medal_${prize.number}" value="${prize.medal}" min="0"></td>
            </tr>
        `;
    }
}

document.getElementById("configForm").onsubmit = async function(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    for (let prize of config.prizes) {
        prize.pachinko = Number(form.get(`pachinko_${prize.number}`));
        prize.medal = Number(form.get(`medal_${prize.number}`));
    }

    await fetch("/save_config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
    });

    alert("保存しました！");
    loadQuestion();
};

window.onload = async () => {
    await loadConfig();
    await loadQuestion();
};
