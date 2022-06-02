import { Collider, GameObject } from 'UnityEngine'
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import UIManager from './UIManager';

export default class NpcScript extends ZepetoScriptBehaviour {

    public uiManagerGameObject: GameObject;
    private uiManager: UIManager;

    public imageDialogueBox: GameObject;
    // 1~3
    public uiAnimationType: number;
    Start() {    

        this.uiManager = this.uiManagerGameObject.GetComponent<UIManager>();

    }


    OnTriggerEnter(collider: Collider) {

        if (collider.name == ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.name) {     

            this.StartCoroutine(this.uiManager.PopupUI(this.imageDialogueBox, this.uiAnimationType));

        }
    }

    OnTriggerExit(collider: Collider) {

        if (collider.name == ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.name) {

            this.StartCoroutine(this.uiManager.HideUI(this.imageDialogueBox));

        }
    }



}