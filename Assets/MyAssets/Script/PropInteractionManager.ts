import { Camera, Canvas, Collider, GameObject, Vector3 } from 'UnityEngine';
import { Button } from 'UnityEngine.UI';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ClientStarter from '../../ZepetoScripts/Multiplay/ClientStarter';

export default class PropInteractionManager extends ZepetoScriptBehaviour {
    public canvasInteraction: Canvas;
    private showButton: bool;
    public buttonInteraction: Button;
    public clientStarterGameObject: GameObject;
    private clientStarter: ClientStarter;
    private viewportPosition: Vector3;
    private zepetoCamera: Camera;
    public zepetoPlayer: GameObject;   

    // 0 = guitar
    public propIndex: string;
    Start() {    

        this.zepetoCamera = this.zepetoPlayer.transform.GetChild(2).GetChild(0).GetChild(0).GetComponent<Camera>(); 

        this.clientStarter = this.clientStarterGameObject.GetComponent<ClientStarter>();


        this.buttonInteraction.onClick.AddListener(() => {           

                this.clientStarter.SendAttachPropMessage(this.propIndex);


        });


    }

    OnTriggerEnter(collider: Collider) {

        if (collider.name == ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.name) {    
                this.showButton = true;
                this.buttonInteraction.gameObject.SetActive(true);             
        }
    }

    OnTriggerExit(collider: Collider) {

        if (collider.name == ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.name) {
                this.showButton = false;
                this.buttonInteraction.gameObject.SetActive(false);                      
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