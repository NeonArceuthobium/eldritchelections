// ========================
// 📝 Unified Dialogue System for Construct 3
// ========================

window.isChoiceActive = false;

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
window.onDialogueClick = function () {
    if (window.isChoiceActive) {
        console.log("🛑 Choices are active — click ignored.");
        return;
    }
    console.log("🖱️ Click detected...");
    if (window.isTyping) {
        window.skipTypewriter();
    } else {
        window.advanceDialogue();
    }
};

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
    if (!rt) return;
    let textbox = rt.objects.ctc_retro_textbox_.getFirstInstance();
    if (!textbox) {
        console.error("❌ Blinking textbox object not found: ctc_retro_textbox_");
        return;
    }
    window.stopBlinking();
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
    window.stopBlinking();
    if (window.typingInterval) {
        clearTimeout(window.typingInterval);
    }
    let index = 0;
    function typeNextChar() {
        if (!window.isTyping) {
            clearTimeout(window.typingInterval);
            return;
        }
        if (index < fullText.length) {
            textObject.text += fullText[index];
            index++;
            window.typingInterval = setTimeout(typeNextChar, speed);
        } else {
            window.isTyping = false;
            window.startBlinking();
        }
    }
    window.typingInterval = setTimeout(typeNextChar, speed);
};

// ------------------------------------------------------------------------------------------------
// 7) SHOW DIALOGUE
// ------------------------------------------------------------------------------------------------
window.showDialogue = function() {
    let rt = getRuntime();
    if (!rt) return;
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
    window.stopBlinking();
    let speakerTextObj = rt.objects.SpeakerText.getFirstInstance();
    let dialogueTextObj = rt.objects.DialogueText.getFirstInstance();
    if (!speakerTextObj || !dialogueTextObj) {
        console.error("❌ SpeakerText or DialogueText object not found.");
        return;
    }
    speakerTextObj.text = entry.speaker || "";
    window.typewriterEffect(dialogueTextObj, entry.text, 50);
    console.log("✅ Typewriter started for:", speakerTextObj.text, entry.text);
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
    window.isChoiceActive = true;
    let rt = getRuntime();
    if (!rt) return;

    rt.globalVars.CurrentOptions = optionsArray;
    rt.globalVars.AllowChoiceClick = 1; // ✅ ENABLE CHOICE INPUT
    console.log("📌 Showing choices:", optionsArray);

    let choicetext1 = rt.objects.RedChoiceText.getFirstInstance();
    let choicetext2 = rt.objects.BlueChoiceText.getFirstInstance();
    let button1 = rt.objects.ChoiceButton1.getFirstInstance();
    let button2 = rt.objects.ChoiceButton2.getFirstInstance();

    if (!button1 || !button2) {
        console.error("❌ ChoiceButton1 or ChoiceButton2 not found.");
        return;
    }

    // Set text
    choicetext1.text = optionsArray[0].text;
    choicetext2.text = optionsArray[1].text;

    // Make visible
    choicetext1.isVisible = true;
    choicetext2.isVisible = true;
    button1.isVisible = true;
    button2.isVisible = true;

    // Assign choice indices
    button1.choiceIndex = 0;
    button2.choiceIndex = 1;

    // Attach click listeners (DOM only; sprites handled in event sheet)
    window.attachChoiceListeners();
};

// ------------------------------------------------------------------------------------------------
// 12) SELECT CHOICE
// ------------------------------------------------------------------------------------------------
window.selectChoice = function(choiceIndex) {
    let rt = getRuntime();
    if (!rt) return;

    rt.globalVars.AllowChoiceClick = 0; // ✅ DISABLE CHOICE INPUT

    if (!rt.globalVars.CurrentOptions) {
        console.error("❌ CurrentOptions is undefined.");
        return;
    }

    let choice = rt.globalVars.CurrentOptions[choiceIndex];
    if (!choice) {
        console.error("❌ No choice found at index:", choiceIndex);
        return;
    }

    console.log("🎯 Player chose:", choice.text, "| route:", choice.route);

    let button1 = rt.objects.ChoiceButton1.getFirstInstance();
    let button2 = rt.objects.ChoiceButton2.getFirstInstance();
    let choicetext1 = rt.objects.RedChoiceText.getFirstInstance();
    let choicetext2 = rt.objects.BlueChoiceText.getFirstInstance();

    if (choicetext1) choicetext1.isVisible = false;
    if (choicetext2) choicetext2.isVisible = false;
    if (button1) button1.isVisible = false;
    if (button2) button2.isVisible = false;

    rt.globalVars.CurrentDialogue = choice.route;
    rt.globalVars.CurrentIndex = "1";
    window.isChoiceActive = false;

    // === Handle background & BGM transition ===
    window.handleSceneTransition(choice.route);
    window.showDialogue();
};

// ------------------------------------------------------------------------------------------------
// 13) HIDE CHOICE BUTTONS (optional helper)
// ------------------------------------------------------------------------------------------------
window.hideChoiceButtons = function() {
    let rt = getRuntime();
    if (!rt) return;

    rt.globalVars.AllowChoiceClick = 0; // ✅ DISABLE CHOICE INPUT

    let button1 = rt.objects.ChoiceButton1.getFirstInstance();
    let button2 = rt.objects.ChoiceButton2.getFirstInstance();
    let choicetext1 = rt.objects.RedChoiceText.getFirstInstance();
    let choicetext2 = rt.objects.BlueChoiceText.getFirstInstance();

    if (choicetext1) choicetext1.isVisible = false;
    if (choicetext2) choicetext2.isVisible = false;

    if (button1) button1.isVisible = false;
    if (button2) button2.isVisible = false;
};

// ------------------------------------------------------------------------------------------------
// 14) ADD SPRITE HITBOX CLICK HANDLERS (DOM fallback)
// ------------------------------------------------------------------------------------------------
window.attachChoiceListeners = function() {
    let rt = getRuntime();
    if (!rt) return;

    let button1 = rt.objects.ChoiceButton1.getFirstInstance();
    let button2 = rt.objects.ChoiceButton2.getFirstInstance();

    if (!button1 || !button2) {
        console.error("❌ Cannot attach listeners — choice buttons not found.");
        return;
    }

    // Remove previous DOM listeners to avoid stacking
    if (button1.domElement) button1.domElement.removeEventListener("click", button1._choiceClick);
    if (button2.domElement) button2.domElement.removeEventListener("click", button2._choiceClick);

    // Define new click handlers
    button1._choiceClick = () => {
        if (rt.globalVars.AllowChoiceClick === 1) {
            window.selectChoice(button1.choiceIndex);
        }
    };

    button2._choiceClick = () => {
        if (rt.globalVars.AllowChoiceClick === 1) {
            window.selectChoice(button2.choiceIndex);
        }
    };

    // Attach listeners (DOM fallback only; Construct handles sprite clicks)
    if (button1.instVars?.__dom?.element) {
        button1.instVars.__dom.element.addEventListener("click", button1._choiceClick);
    } else if (button1.domElement) {
        button1.domElement.addEventListener("click", button1._choiceClick);
    }

    if (button2.instVars?.__dom?.element) {
        button2.instVars.__dom.element.addEventListener("click", button2._choiceClick);
    } else if (button2.domElement) {
        button2.domElement.addEventListener("click", button2._choiceClick);
    }

    console.log("🖲️ Choice listeners attached to sprite hitboxes (if DOM present).");
};


// ------------------------------------------------------------------------------------------------
// Scene Transition Functions
// ------------------------------------------------------------------------------------------------
window.handleSceneTransition = function(dialogueKey) {
    const rt = getRuntime();
    if (!rt) return;
    const jsonObj = rt.objects.DialogueJSONObject.getFirstInstance();
    if (!jsonObj) return;
    const jsonData = jsonObj.getJsonDataCopy();
    const section = jsonData[dialogueKey];
    if (!section) return;
    const bgmName = section.bgm || null;
    // const bgImageName = section.background || null;
    if (bgmName) window.transitionBGM(bgmName);
    // if (bgImageName) window.transitionBackground(bgImageName);
};

// ------------------------------------------------------------------------------------------------
// Transition Background Music using the new audio API
// ------------------------------------------------------------------------------------------------
window.transitionBGM = function(newTrackName) {
    const rt = getRuntime();
    if (!rt) return;
    console.log("Setting global BGMName to:", newTrackName);
    rt.globalVars.BGMName = newTrackName;  // Set the Construct global variable
    console.log("Calling PlayBGM function");
    rt.callFunction("PlayBGM");  // Now the event can use BGMName directly
};


// ------------------------------------------------------------------------------------------------
// Transition Background using the new image loader & fade functions
// ------------------------------------------------------------------------------------------------
window.transitionBackground = function(newBgFilename) {
    const rt = getRuntime();
    if (!rt) return;
    // Use consistent object name: BackgroundSprite
    const bgSprite = rt.objects.BackgroundSprite.getFirstInstance();
    if (!bgSprite) return;
    console.log("🌆 Switching background to:", newBgFilename);
    rt.callFunction("FadeOutBG", [bgSprite.uid, 1]);
    setTimeout(() => {
        bgSprite.loadImageFromUrl(`images/${newBgFilename}`, () => {
            rt.callFunction("FadeInBG", [bgSprite.uid, 1]);
        });
    }, 1000);
};

// ------------------------------------------------------------------------------------------------
// OPTIONAL: Toggle Audio Mute using the new audio API
// ------------------------------------------------------------------------------------------------
window.toggleAudioMute = function() {
    const rt = getRuntime();
    if (!rt) return;
    // We simulate mute by setting the master volume to 0 and unmute by setting it to 1.
    // (Adjust these values as needed based on your project’s volume scale.)
    if (rt._audioMuted) {
        rt.audio.setMasterVolume(1.0);
        rt._audioMuted = false;
        console.log("Audio unmuted.");
    } else {
        rt.audio.setMasterVolume(0.0);
        rt._audioMuted = true;
        console.log("Audio muted.");
    }
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
		window.selectChoice(0);
	},

	async Main_Event4_Act1(runtime, localVars)
	{
		window.selectChoice(1);
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

