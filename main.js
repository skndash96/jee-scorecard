(async () => {
    //Retrieve Shift Information and format as DDs1 or DDs2
    let [date, shift] = Array.from(document.querySelector("table tbody")/*first table*/
        .children).slice(3, 5).map(tr => tr.lastElementChild.textContent.trim());
    date = date.split("/").shift();
    shift = shift.toLowerCase().includes("am") ? "1" : "2";
    let paper = date + "s" + shift;

    //ADD NEW PAPER
    /*
    1. Get Question Id mapped to Option Id / Answer Number
    2. Take that Object and put in extendsclass.com and copy bin id
    3. Map bin id in paper_map
    4. Good to go
    */
    let paper_map = {
        "27s1": "https://json.extendsclass.com/bin/ad0b26002978",
        "27s2": "https://json.extendsclass.com/bin/fefdb99829ed",
        "29s1": "https://json.extendsclass.com/bin/904f0d88131c",
        "29s2": "https://json.extendsclass.com/bin/46c43bba08a8",
        "30s1": "https://json.extendsclass.com/bin/81f6b0ed9c31",
        "30s2": "https://json.extendsclass.com/bin/ef17bbd48072",
        "31s1": "https://json.extendsclass.com/bin/4c2836982021",
        "31s2": "https://json.extendsclass.com/bin/a6a0bd4c830b",
        
        "01s1": "https://json.extendsclass.com/bin/2902b9729668",
        "01s2": "https://json.extendsclass.com/bin/d2ba75006751",

        "06s1": "https://json.extendsclass.com/bin/2508ed9bac9a",
        "08s2": "https://json.extendsclass.com/bin/a54406466af0"
    };

    //FETCH ANSWER KE
    let ans_map;
    try {
        ans_map = await fetch(paper_map[paper]);
        ans_map = await ans_map.json();
    } catch (e) {
        console.error(e);
        console.error("FAILED to fetch answer keys. Most probably because keys are yet to be uploaded.");
    }

    let qs = [];

    //RETRIEVE QUESTIONS
    for (let tbody of document.querySelectorAll("table.menu-tbl > tbody")) {
        let trs = tbody.children,
            tds = Array.from(trs).map(tr => tr.lastChild.textContent.trim());

        let is_mcq = tds[0] === "MCQ";

        let marked = tbody.parentNode.parentElement.firstChild.firstChild.lastChild.lastChild.textContent.trim();
        marked = is_mcq
            ? ("Not Answered" === tds[6] ? null : tds.slice(2, 6)[parseInt(tds[7]) - 1])
            : ("Not Answered" === tds[2] ? null : marked);

        qs.push({
            type: tds[0],
            id: tds[1],
            opts: is_mcq ? tds.slice(2, 6) : [],
            marked,
            score: ans_map[tds[1]] === marked ? 4 : marked ? -1 : 0
        });
    }

    let attempted = 0, unattempted = 0,
        correct = 0, wrong = 0;

    //CREATE OUTPUT
    let [m, ms] = loop("MAT", 0);
    let [p, ps] = loop("PHY", 30);
    let [c, cs] = loop("CHE", 60);
    let total = m + p + c;
    let sw = [ms, ps, cs].join("\n\n");

    function loop(sub, start) {
        let total = 0;

        let s = sub;

        qs.slice(start, start + 30).forEach(({ score }, i) => {
            total += score;

            if (i % 10 === 0) s += "\n"
            s += pad(i + start, get_emo(score), 5);
        });

        return [total, s];
    }

    function pad(i, e, space) {
        let s = `${i < 10 ? "0" : ""}${i+1}${e}`;

        while (s.length < space) { s += " " }
        return s;
    }

    function get_emo(score) {
        attempted++;

        switch (score) {
            case 4:
                correct++;
                return "✅";
            case -1:
                wrong++;
                return "❌";
            case 0:
                attempted--;
                unattempted++;
                return "❔"
        }
    }

    let output = `
${paper}
TOTAL: ${total}/300

Correct: ${correct}
Incorrect: ${wrong}
Attempted: ${attempted}
Unattempted: ${unattempted}

Physics: ${p}/100
Chemistry: ${c}/100
Maths: ${m}/100

${sw}`;

    let box = document.createElement("div");
    box.style = "background: black; color: white; padding: 1rem; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); box-shadow: 3px 3px 10px #00000055;";
    
    let el = document.createElement("pre");
    el.style = "font-family: sans-serif;";
    el.textContent = output;
    
    let button = document.createElement("button");
    button.addEventListener("click", e => {
        window.navigator.clipboard.writeText(output);
        e.target.textContent = "copied";
    });
    button.style = "width: fit-content; display: block; margin: 1rem 0 0 auto;";
    button.textContent = "COPY";

    box.append(el, button);
    
    document.body.appendChild(box);
})();
