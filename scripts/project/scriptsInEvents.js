


const scriptsInEvents = {

	async EventSheet1_Event1_Act1(runtime, localVars)
	{
		globalThis.c3Runtime = runtime;
		console.log("Runtime stored in globalThis:", globalThis.c3Runtime);
		
		
	},

	async Functions_Event1(runtime, localVars)
	{
		window.showDialogue = function() {
		    let jsonObjectInstance = runtime.objects.DialogueJSONObject.getFirstInstance();
		    if (!jsonObjectInstance) {
		        console.error("❌ JSON object not found in Construct 3.");
		        return;
		    }
		    let jsonData = jsonObjectInstance.getJsonDataCopy();
		    if (!jsonData) {
		        console.error("❌ JSON data is missing or undefined.");
		        return;
		    }
		    
		    let section = jsonData[runtime.globalVars.CurrentDialogue];
		    if (!section) {
		        console.error("❌ Section not found for", runtime.globalVars.CurrentDialogue);
		        return;
		    }
		
		    let indexKey = String(runtime.globalVars.CurrentIndex);
		    console.log("🔎 Fetching from:", runtime.globalVars.CurrentDialogue, "[", indexKey, "]");
		
		    let entry = section[indexKey];
		
		    // ✅ Handle case where the entry is missing
		    if (!entry) {
		        console.error("❌ Entry not found at index:", indexKey);
		        return;
		    }
		
		    console.log("🎭 Entry found:", entry);
		
		    let speakerTextObject = runtime.objects.SpeakerText.getFirstInstance();
		    let dialogueTextObject = runtime.objects.DialogueText.getFirstInstance();
		    if (!speakerTextObject || !dialogueTextObject) {
		        console.error("❌ Text objects not found in Construct 3.");
		        return;
		    }
		
		    // ✅ Ensure correct text is displayed
		    speakerTextObject.text = entry.speaker;
		    dialogueTextObject.text = entry.text;
		
		    console.log("✅ Text updated:", speakerTextObject.text, dialogueTextObject.text);
		
		    // ✅ If the entry has "options", display choice buttons
		    if (entry.options) {
		        console.log("🟢 Choices detected:", entry.options);
		        window.showChoices(entry.options);
		    }
		};
		
	},

	async Functions_Event2(runtime, localVars)
	{
		window.nextDialogueIndex = function() {
		    let jsonObjectInstance = runtime.objects.DialogueJSONObject.getFirstInstance();
		    
		    if (!jsonObjectInstance) {
		        console.error("❌ Error: DialogueJSONObject not found.");
		        return "";
		    }
		
		    let jsonData = jsonObjectInstance.getJsonDataCopy();
		    if (!jsonData) {
		        console.error("❌ Error: JSON data is missing or undefined.");
		        return "";
		    }
		
		    let section = jsonData[runtime.globalVars.CurrentDialogue];
		
		    if (!section) {
		        console.error("❌ Error: Section not found for", runtime.globalVars.CurrentDialogue);
		        return "";
		    }
		
		    console.log("📜 Current dialogue section:", section);
		
		    let numericKeys = [];
		    let letterKeys = [];
		
		    Object.keys(section).forEach(key => {
		        if (!isNaN(key)) {
		            numericKeys.push(Number(key)); // Convert to number for sorting
		        } else if (key !== "background" && key !== "bgm") {
		            letterKeys.push(key); // Keep letters except background/bgm
		        }
		    });
		
		    numericKeys.sort((a, b) => a - b);
		
		    let sortedLetterKeys = [];
		    if (letterKeys.includes("F")) sortedLetterKeys.push("F");
		    if (letterKeys.includes("C")) sortedLetterKeys.push("C");
		
		    let sortedKeys = [...numericKeys.map(String), ...sortedLetterKeys];
		
		    console.log("🔢 Sorted keys:", sortedKeys);
		
		    let currentKeyIndex = sortedKeys.indexOf(String(runtime.globalVars.CurrentIndex));
		
		    if (sortedKeys[currentKeyIndex] === "F") {
		        console.log("🛑 Reached Final Entry (F), stopping for choices.");
		        return "";
		    }
		
		    if (currentKeyIndex + 1 < sortedKeys.length) {
		        return sortedKeys[currentKeyIndex + 1];
		    } else {
		        console.log("🛑 No more dialogue entries.");
		        return "";
		    }
		};
		
	},

	async Functions_Event3(runtime, localVars)
	{
		window.advanceDialogue = function() {
		    let nextIndex = window.nextDialogueIndex();
		
		    if (nextIndex !== "") {
		        console.log("➡️ Advancing to next dialogue:", nextIndex);
		        runtime.globalVars.CurrentIndex = nextIndex; // ✅ Update index (as string)
		        window.showDialogue(); // ✅ Show updated dialogue
		    } else {
		        console.log("🛑 No more dialogue available.");
		    }
		};
		
	},

	async Functions_Event4(runtime, localVars)
	{
		// 🟢 Show choices when a decision point is reached
		window.showChoices = function(optionsArray) {
		    runtime.globalVars.CurrentOptions = optionsArray;
		    console.log("📌 Showing choices:", optionsArray);
		
		    let button1 = runtime.objects.ChoiceButton1.getFirstInstance();
		    let button2 = runtime.objects.ChoiceButton2.getFirstInstance();
		
		    if (!button1 || !button2) {
		        console.error("❌ Choice buttons not found.");
		        return;
		    }
		
		    // ✅ Set button text dynamically
		    button1.text = optionsArray[0].text;
		    button2.text = optionsArray[1].text;
		
		    // ✅ Ensure buttons are visible
		    button1.isVisible = true;
		    button2.isVisible = true;
		
		    // ✅ Reset previous event listeners (force remove)
		    button1.onclick = null;
		    button2.onclick = null;
		
		    // ✅ Attach fresh event listeners per choice
		    button1.onclick = function() { window.selectChoice(0); };
		    button2.onclick = function() { window.selectChoice(1); };
		
		    console.log("✅ Choice buttons updated:", button1.text, button2.text);
		};
		
	},

	async Functions_Event5(runtime, localVars)
	{
		// 🟢 Handle when a choice is made
		window.selectChoice = function(choiceIndex) {
		    let selectedOption = runtime.globalVars.CurrentOptions[choiceIndex];
		
		    if (!selectedOption) {
		        console.error("❌ No option found at index:", choiceIndex);
		        return;
		    }
		
		    console.log("🎯 Player chose:", selectedOption.text, "| Route:", selectedOption.route);
		
		    // ✅ Hide buttons after selection
		    let button1 = runtime.objects.ChoiceButton1.getFirstInstance();
		    let button2 = runtime.objects.ChoiceButton2.getFirstInstance();
		    if (button1) button1.isVisible = false;
		    if (button2) button2.isVisible = false;
		
		    let chosenPath = selectedOption.route;
		    
		    // ✅ Update dialogue state
		    runtime.globalVars.CurrentDialogue = chosenPath;
		    runtime.globalVars.CurrentIndex = "1"; // Start from first entry
		
		    let jsonObjectInstance = runtime.objects.DialogueJSONObject.getFirstInstance();
		    let jsonData = jsonObjectInstance.getJsonDataCopy();
		    let newSection = jsonData[chosenPath];
		
		    if (!newSection) {
		        console.error("❌ Could not find section:", chosenPath);
		        return;
		    }
		
		//     // ✅ Load Background (if exists)
		//     if (newSection.background) {
		//         console.log("🌄 Setting background:", newSection.background);
		//         runtime.objects.BackgroundSprite.getFirstInstance().setAnimation(newSection.background);
		//     }
		
		//     // ✅ Load BGM (if exists)
		//     if (newSection.bgm) {
		//         console.log("🎵 Playing BGM:", newSection.bgm);
		//         runtime.callFunction("PlayBGM", newSection.bgm);
		//     }
		
		    console.log("🔀 Switching to new dialogue section:", chosenPath);
		
		    // ✅ Show first dialogue entry from selected choice
		    window.showDialogue();
		};
		
	},

	async Functions_Event6(runtime, localVars)
	{
		// 🟢 Hide buttons when not in use
		window.hideChoiceButtons = function () {
		    let btn1 = runtime.objects.ChoiceButton1.getFirstInstance();
		    let btn2 = runtime.objects.ChoiceButton2.getFirstInstance();
		    if (btn1) btn1.isVisible = false;
		    if (btn2) btn2.isVisible = false;
		};
	},

	async Main_Event2_Act8(runtime, localVars)
	{
		window.showDialogue();
		window.advanceDialogue();
	},

	async Main_Event3_Act1(runtime, localVars)
	{
		window.advanceDialogue();
	},

	async Main_Event4_Act1(runtime, localVars)
	{
		window.selectChoice(0)
	},

	async Main_Event5_Act1(runtime, localVars)
	{
		window.selectChoice(1)
	}

};

self.C3.ScriptsInEvents = scriptsInEvents;

