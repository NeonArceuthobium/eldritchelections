// ========================
// 📝 Unified Dialogue System for Construct 3
// ========================

// ------------------------------------------------------------------------------------------------
// 1) Listen for runtimecreated & store it in window.c3Runtime
// ------------------------------------------------------------------------------------------------
document.addEventListener("runtimecreated", (event) => {
    window.c3Runtime = event.runtime;
    console.log("✅ runtime stored in window.c3Runtime");

    // Optionally, if you want to auto-run showDialogue after a short delay:
    setTimeout(() => {
        if (window.showDialogue) {
            console.log("Attempting to call showDialogue automatically...");
            window.showDialogue();
        } else {
            console.error("❌ showDialogue not yet defined!");
        }
    }, 100);
});

// ------------------------------------------------------------------------------------------------
// 2) Helper: getRuntime() returns window.c3Runtime
// ------------------------------------------------------------------------------------------------
function getRuntime() {
    if (!window.c3Runtime) {
        console.error("❌ window.c3Runtime is not set. The runtime is not ready yet!");
        return null;
    }
    return window.c3Runtime;
}

// ------------------------------------------------------------------------------------------------
// 3) Global flags & variables
// ------------------------------------------------------------------------------------------------
window.isTyping = false;         // True while a line is typing out
window.typingInterval = null;    // setTimeout reference for typewriter
window.blinkingInterval = null;  // setInterval reference for blinking arrow
window.isAdvancing = false;      // Optional: helps block multiple rapid clicks

// ------------------------------------------------------------------------------------------------
// 4) Click Handler: skip or advance
// ------------------------------------------------------------------------------------------------
window.onDialogueClick = function() {
    console.log("🖱️ Click detected...");
    if (window.isTyping) {
        window.skipTypewriter(); // If text is typing, skip
    } else {
        window.advanceDialogue(); // Otherwise advance
    }
};

// Attach this click only once
if (!window.isClickListenerAdded) {
    document.addEventListener("click", window.onDialogueClick);
    window.isClickListenerAdded = true;
    console.log("✅ Dialogue click listener attached once.");
}

// ------------------------------------------------------------------------------------------------
// 5) START / STOP Blinking
// ------------------------------------------------------------------------------------------------
window.startBlinking = function() {
    let rt = getRuntime();
    if (!rt) return; // stops if no runtime yet

    let textbox = rt.objects.ctc_retro_textbox_.getFirstInstance();
    if (!textbox) {
        console.error("❌ Blinking textbox object not found: ctc_retro_textbox_");
        return;
    }
    window.stopBlinking(); // clear old intervals

    window.blinkingInterval = setInterval(() => {
        textbox.isVisible = !textbox.isVisible;
    }, 500);
    console.log("✨ Blinking started.");
};

window.stopBlinking = function() {
    let rt = getRuntime();
    if (!rt) return;

    let textbox = rt.objects.ctc_retro_textbox_.getFirstInstance();
    if (!textbox) return;

    if (window.blinkingInterval) {
        clearInterval(window.blinkingInterval);
        window.blinkingInterval = null;
    }
    textbox.isVisible = true;
    console.log("⏹️ Blinking stopped.");
};

// ------------------------------------------------------------------------------------------------
// 6) TYPEWRITER EFFECT
// ------------------------------------------------------------------------------------------------
window.typewriterEffect = function(textObject, fullText, speed = 50) {
    window.isTyping = true;
    textObject.text = "";

    window.stopBlinking(); // no blinking while typing

    if (window.typingInterval) {
        clearTimeout(window.typingInterval);
    }

    let index = 0;
    function typeNextChar() {
        if (!window.isTyping) {
            // If skipping canceled the typing
            clearTimeout(window.typingInterval);
            return;
        }
        if (index < fullText.length) {
            textObject.text += fullText[index];
            index++;
            window.typingInterval = setTimeout(typeNextChar, speed);
        } else {
            // Done typing
            window.isTyping = false;
            window.startBlinking(); // arrow starts blinking
        }
    }

    // Start
    window.typingInterval = setTimeout(typeNextChar, speed);
};

// ------------------------------------------------------------------------------------------------
// 7) SHOW DIALOGUE
// ------------------------------------------------------------------------------------------------
window.showDialogue = function() {
    let rt = getRuntime();
    if (!rt) return;

    // If CurrentIndex is "0" or undefined, default to "1"
    if (!rt.globalVars.CurrentIndex || rt.globalVars.CurrentIndex === "0") {
        rt.globalVars.CurrentIndex = "1";
    }

    if (window.isTyping) {
        console.warn("⏳ Already typing, skipping showDialogue() call.");
        return;
    }

    let jsonObj = rt.objects.DialogueJSONObject.getFirstInstance();
    if (!jsonObj) {
        console.error("❌ DialogueJSONObject not found.");
        return;
    }
    let jsonData = jsonObj.getJsonDataCopy();
    if (!jsonData) {
        console.error("❌ JSON data is missing or undefined.");
        return;
    }

    let section = jsonData[rt.globalVars.CurrentDialogue];
    if (!section) {
        console.error("❌ Section not found for:", rt.globalVars.CurrentDialogue);
        return;
    }

    let indexKey = String(rt.globalVars.CurrentIndex);
    let entry = section[indexKey];
    console.log(`🔎 Fetching [${rt.globalVars.CurrentDialogue}] entry [${indexKey}]`);
    if (!entry) {
        console.error("❌ Entry not found at index:", indexKey);
        return;
    }
    console.log("🎭 Entry found:", entry);

    window.stopBlinking(); // ensure arrow is off

    let speakerTextObj = rt.objects.SpeakerText.getFirstInstance();
    let dialogueTextObj = rt.objects.DialogueText.getFirstInstance();
    if (!speakerTextObj || !dialogueTextObj) {
        console.error("❌ SpeakerText or DialogueText object not found.");
        return;
    }

    // Set speaker name
    speakerTextObj.text = entry.speaker || "";

    // Typewriter effect
    window.typewriterEffect(dialogueTextObj, entry.text, 50);
    console.log("✅ Typewriter started for:", speakerTextObj.text, entry.text);

    // If branching
    if (entry.options) {
        window.showChoices(entry.options);
    }
};

// ------------------------------------------------------------------------------------------------
// 8) SKIP TYPEWRITER
// ------------------------------------------------------------------------------------------------
window.skipTypewriter = function() {
    if (!window.isTyping) return;

    let rt = getRuntime();
    if (!rt) return;

    let dialogueTextObj = rt.objects.DialogueText.getFirstInstance();
    if (!dialogueTextObj) {
        console.error("❌ DialogueText object not found.");
        return;
    }

    let jsonObj = rt.objects.DialogueJSONObject.getFirstInstance();
    let jsonData = jsonObj.getJsonDataCopy();
    let section = jsonData[rt.globalVars.CurrentDialogue];
    let entry = section[String(rt.globalVars.CurrentIndex)];

    console.log("⏩ Skipping typewriter, showing full text instantly.");

    window.isTyping = false;
    clearTimeout(window.typingInterval);

    dialogueTextObj.text = entry.text;

    window.stopBlinking();
    window.startBlinking();
};

// ------------------------------------------------------------------------------------------------
// 9) ADVANCE DIALOGUE
// ------------------------------------------------------------------------------------------------
window.advanceDialogue = function() {
    if (window.isTyping) {
        window.skipTypewriter();
        return;
    }

    if (window.isAdvancing) {
        console.log("🚫 Already advancing, ignoring extra clicks.");
        return;
    }
    window.isAdvancing = true;

    window.stopBlinking();

    let nextKey = window.nextDialogueIndex();
    if (!nextKey) {
        console.log("🛑 No more dialogue, stopping here.");
        window.isAdvancing = false;
        return;
    }

    let rt = getRuntime();
    if (!rt) return;

    console.log("➡️ Advancing to next index:", nextKey);
    rt.globalVars.CurrentIndex = nextKey;
    window.showDialogue();

    setTimeout(() => {
        window.isAdvancing = false;
    }, 200);
};

// ------------------------------------------------------------------------------------------------
// 🔟 NEXT DIALOGUE INDEX
// ------------------------------------------------------------------------------------------------
window.nextDialogueIndex = function() {
    let rt = getRuntime();
    if (!rt) return "";

    let jsonObj = rt.objects.DialogueJSONObject.getFirstInstance();
    if (!jsonObj) {
        console.error("❌ DialogueJSONObject not found.");
        return "";
    }
    let jsonData = jsonObj.getJsonDataCopy();
    if (!jsonData) {
        console.error("❌ JSON data is missing or undefined.");
        return "";
    }

    let section = jsonData[rt.globalVars.CurrentDialogue];
    if (!section) {
        console.error("❌ Section not found:", rt.globalVars.CurrentDialogue);
        return "";
    }

    // Distinguish numeric vs letter keys
    let numericKeys = [];
    let letterKeys = [];
    for (let key of Object.keys(section)) {
        if (key === "background" || key === "bgm") continue;
        if (!isNaN(key)) numericKeys.push(Number(key));
        else letterKeys.push(key);
    }

    numericKeys.sort((a, b) => a - b);
    letterKeys.sort();

    let sortedKeys = numericKeys.map(String).concat(letterKeys);
    console.log("All sorted keys:", sortedKeys);

    let currentKey = String(rt.globalVars.CurrentIndex);
    let currentPos = sortedKeys.indexOf(currentKey);

    if (currentPos === -1 || currentPos + 1 >= sortedKeys.length) {
        return "";
    }
    return sortedKeys[currentPos + 1];
};

// ------------------------------------------------------------------------------------------------
// 11) SHOW CHOICES (2-choice default example)
// ------------------------------------------------------------------------------------------------
window.showChoices = function(optionsArray) {
    let rt = getRuntime();
    if (!rt) return;

    rt.globalVars.CurrentOptions = optionsArray;
    console.log("📌 Showing choices:", optionsArray);

    let button1 = rt.objects.ChoiceButton1.getFirstInstance();
    let button2 = rt.objects.ChoiceButton2.getFirstInstance();
    if (!button1 || !button2) {
        console.error("❌ ChoiceButton1 or ChoiceButton2 not found.");
        return;
    }

    button1.text = optionsArray[0].text;
    button2.text = optionsArray[1].text;
    button1.isVisible = true;
    button2.isVisible = true;

    button1.onclick = () => window.selectChoice(0);
    button2.onclick = () => window.selectChoice(1);
};

// ------------------------------------------------------------------------------------------------
// 12) SELECT CHOICE
// ------------------------------------------------------------------------------------------------
window.selectChoice = function(choiceIndex) {
    let rt = getRuntime();
    if (!rt) return;

    let choice = rt.globalVars.CurrentOptions[choiceIndex];
    if (!choice) {
        console.error("❌ No choice found at index:", choiceIndex);
        return;
    }
    console.log("🎯 Player chose:", choice.text, "| route:", choice.route);

    let button1 = rt.objects.ChoiceButton1.getFirstInstance();
    let button2 = rt.objects.ChoiceButton2.getFirstInstance();
    if (button1) button1.isVisible = false;
    if (button2) button2.isVisible = false;

    rt.globalVars.CurrentDialogue = choice.route;
    rt.globalVars.CurrentIndex = "1";

    window.showDialogue();
};

// ------------------------------------------------------------------------------------------------
// 13) HIDE CHOICE BUTTONS (optional helper)
// ------------------------------------------------------------------------------------------------
window.hideChoiceButtons = function() {
    let rt = getRuntime();
    if (!rt) return;

    let button1 = rt.objects.ChoiceButton1.getFirstInstance();
    let button2 = rt.objects.ChoiceButton2.getFirstInstance();
    if (button1) button1.isVisible = false;
    if (button2) button2.isVisible = false;
};



const scriptsInEvents = {

	async Main_Event1_Act2(runtime, localVars)
	{
		setTimeout(() => { if (window.showDialogue) { window.showDialogue(); } else { console.error('❌ showDialogue is not loaded yet.'); } }, 100);
		
		globalThis.c3Runtime = runtime;
		console.log("Runtime stored in globalThis:", globalThis.c3Runtime);
	},

	async Main_Event3_Act1(runtime, localVars)
	{
		window.selectChoice(0)
	},

	async Main_Event4_Act1(runtime, localVars)
	{
		window.selectChoice(1)
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

