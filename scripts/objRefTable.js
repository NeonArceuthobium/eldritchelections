const C3 = self.C3;
self.C3_GetObjectRefTable = function () {
	return [
		C3.Plugins.Sprite,
		C3.Plugins.Flowchart,
		C3.Plugins.Mouse,
		C3.Plugins.Text,
		C3.Plugins.AJAX,
		C3.Plugins.Json,
		C3.Plugins.Browser,
		C3.Plugins.Button,
		C3.Plugins.System.Cnds.OnLayoutStart,
		C3.ScriptsInEvents.EventSheet1_Event1_Act1,
		C3.ScriptsInEvents.Functions_Event1,
		C3.ScriptsInEvents.Functions_Event2,
		C3.ScriptsInEvents.Functions_Event3,
		C3.ScriptsInEvents.Functions_Event4,
		C3.ScriptsInEvents.Functions_Event5,
		C3.ScriptsInEvents.Functions_Event6,
		C3.Plugins.AJAX.Acts.RequestFile,
		C3.Plugins.AJAX.Cnds.OnComplete,
		C3.Plugins.Json.Acts.Parse,
		C3.Plugins.AJAX.Exps.LastData,
		C3.Plugins.System.Acts.SetVar,
		C3.Plugins.Browser.Acts.ConsoleLog,
		C3.Plugins.Json.Exps.ToBeautifiedString,
		C3.ScriptsInEvents.Main_Event2_Act8,
		C3.Plugins.Mouse.Cnds.OnClick,
		C3.ScriptsInEvents.Main_Event3_Act1,
		C3.Plugins.Button.Cnds.OnClicked,
		C3.ScriptsInEvents.Main_Event4_Act1,
		C3.ScriptsInEvents.Main_Event5_Act1
	];
};
self.C3_JsPropNameTable = [
	{BackgroundImage: 0},
	{FlowchartController: 0},
	{Mouse: 0},
	{Retro_Textbox_02A_Transparent: 0},
	{ctc_retro_textbox_: 0},
	{SpeakerText: 0},
	{AJAX: 0},
	{DialogueJSONObject: 0},
	{Browser: 0},
	{DialogueText: 0},
	{ChoiceButton1: 0},
	{ChoiceButton2: 0},
	{CurrentDialogue: 0},
	{CurrentDialogueIndex: 0}
];

self.InstanceType = {
	BackgroundImage: class extends self.ISpriteInstance {},
	FlowchartController: class extends self.IInstance {},
	Mouse: class extends self.IInstance {},
	Retro_Textbox_02A_Transparent: class extends self.ISpriteInstance {},
	ctc_retro_textbox_: class extends self.ISpriteInstance {},
	SpeakerText: class extends self.ITextInstance {},
	AJAX: class extends self.IInstance {},
	DialogueJSONObject: class extends self.IJSONInstance {},
	Browser: class extends self.IInstance {},
	DialogueText: class extends self.ITextInstance {},
	ChoiceButton1: class extends self.IButtonInstance {},
	ChoiceButton2: class extends self.IButtonInstance {}
}