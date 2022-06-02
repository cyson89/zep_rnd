import { Camera, Canvas, CanvasGroup, Collider, GameObject, SphereCollider, Vector3, WaitForEndOfFrame, WaitForSeconds } from 'UnityEngine';
import { Button, Image } from 'UnityEngine.UI';
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


    public animationIndexToPlay: string;
    private stringTransform: string;
    public interactionPoint: GameObject;

    public buttonJump: Button;
    public canvasGroupHandle: CanvasGroup;

    private isInteracting: bool = false;

    
    Start() {    

        this.zepetoCamera = this.zepetoPlayer.transform.GetChild(2).GetChild(0).GetChild(0).GetComponent<Camera>(); 

        this.clientStarter = this.clientStarterGameObject.GetComponent<ClientStarter>();

        this.StartCoroutine(this.WatchHandleAlpha());

        this.buttonInteraction.onClick.AddListener(() => {           

            for (let i = 0; i < this.transform.parent.childCount; ++i) {
               
                this.transform.parent.GetChild(i).GetComponent<InteractionManager>().ShowInteractionButton(false);
               
            }           

            this.stringTransform = this.animationIndexToPlay + "@@"
            + this.interactionPoint.transform.position.x + "@@" + this.interactionPoint.transform.position.y + "@@" + this.interactionPoint.transform.position.z + "@@"
            + this.interactionPoint.transform.rotation.x.toString() + "@@" + this.interactionPoint.transform.rotation.y.toString() + "@@" + this.interactionPoint.transform.rotation.z.toString() + "@@" + this.interactionPoint.transform.rotation.w.toString() + "@@";
          
            this.clientStarter.SendTeleportMessage(this.stringTransform);

            this.StartCoroutine(this.DelayedSendSetGestureMessage());
        });

        this.buttonJump.onClick.AddListener(()=>{                   

            this.clientStarter.SendCancelGestureMessage();            
            this.ShowInteractionButton(true);

        });        
    }


    public ShowInteractionButton(activate:bool){

        if(activate){                    
            if(Vector3.Distance(ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.transform.position, this.transform.position) < this.GetComponent<SphereCollider>().radius){
                this.buttonInteraction.gameObject.SetActive(true);
                this.showButton = true;
            }           
            this.isInteracting = false;                 
        }else{                   
            this.buttonInteraction.gameObject.SetActive(false);
            this.showButton = false;
            this.isInteracting = true;  
        }
    }

    *WatchHandleAlpha(){

        yield new WaitForSeconds(2);
        while(true){            
          if(this.isInteracting == true)          
                if(this.canvasGroupHandle.alpha > 0.5){           
                    this.clientStarter.SendCancelGestureMessage();                        
                    this.ShowInteractionButton(true);                             
                }                
                yield new WaitForSeconds(0.1);
        }        
    }

    *DelayedSendSetGestureMessage(){

        this.clientStarter.SendSetGestureMessage(this.animationIndexToPlay);

    }


    OnTriggerEnter(collider: Collider) {

        if (collider.name == ZepetoPlayers.instance.LocalPlayer.zepetoPlayer.character.name) {
      
            if(this.isInteracting != true){

                this.buttonInteraction.gameObject.SetActive(true);
                this.showButton = true;
            }
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