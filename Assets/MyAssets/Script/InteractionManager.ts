import { Camera, Canvas, Collider, GameObject, Vector3 } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ClientStarter from '../../ZepetoScripts/Multiplay/ClientStarter';

export default class InteractionManager extends ZepetoScriptBehaviour {

    public clientStarterGameObject: GameObject;
    private clientStarter: ClientStarter;
    public canvasInteraction: Canvas;
    public buttonInteraction: Button;
    private showButton: bool;
    private viewportPosition: Vector3;
    private zepetoCamera: Camera;
    public zepetoPlayer: GameObject;   

    Start() {    

        this.zepetoCamera = this.zepetoPlayer.transform.GetChild(2).GetChild(0).GetChild(0).GetComponent<Camera>(); 

        this.clientStarter = this.clientStarterGameObject.GetComponent<ClientStarter>();

        this.buttonInteraction.onClick.AddListener(() => {
           
            this.buttonInteraction.gameObject.SetActive(false);
            this.showButton = false;

        });
    }

    OnTriggerEnter(collider: Collider) {

        if (collider.name == ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.name) {
      
                this.buttonInteraction.gameObject.SetActive(true);
                this.showButton = true;              

        }
    }

    OnTriggerExit(collider: Collider) {

        if (collider.name == ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.name) {

            this.buttonInteraction.gameObject.SetActive(false);
            this.showButton = false;

        }
    }

    Update() {       

        // update screen space interaction button position
        if (this.showButton) {           

            this.viewportPosition = this.zepetoCamera.WorldToViewportPoint(this.gameObject.transform.position);

            this.buttonInteraction.transform.position = new Vector3(this.canvasInteraction.renderingDisplaySize.x * this.viewportPosition.x,
                this.canvasInteraction.renderingDisplaySize.y * this.viewportPosition.y,
                0);

        }      

    }

}