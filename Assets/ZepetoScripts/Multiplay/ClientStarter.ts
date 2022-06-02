import {ZepetoScriptBehaviour} from 'ZEPETO.Script'
import {ZepetoWorldMultiplay} from 'ZEPETO.World'
import {Room, RoomData} from 'ZEPETO.Multiplay'
import {Player, State, Vector3} from 'ZEPETO.Multiplay.Schema'
import {CharacterState, SpawnInfo, ZepetoPlayers, ZepetoPlayer} from 'ZEPETO.Character.Controller'
import * as UnityEngine from "UnityEngine";


export default class Starter extends ZepetoScriptBehaviour {

    public multiplay: ZepetoWorldMultiplay;

    private room: Room;
    private currentPlayers: Map<string, Player> = new Map<string, Player>();

    public animationClip: UnityEngine.AnimationClip[];

    private Start() {

        this.multiplay.RoomCreated += (room: Room) => {
            this.room = room;
        };

        this.multiplay.RoomJoined += (room: Room) => {
            room.OnStateChange += this.OnStateChange;
        };

        this.StartCoroutine(this.SendMessageLoop(0.1));


        this.StartCoroutine(this.SetMessageHandlers());        

    }

    private *SetMessageHandlers(){

        yield new UnityEngine.WaitForSeconds(2);

        this.room.AddMessageHandler("onTeleport", (message) => {

            this.str = "" + message;          
           
            this.StartCoroutine(this.TryTeleport(this.str));

            console.log(this.str);

        });

        this.room.AddMessageHandler("onSetGesture", (message) => {

            this.str = "" + message;          
           
            this.SetGesture(this.str);

            console.log(this.str);

        });

        this.room.AddMessageHandler("onCancelGesture", (message) => {

            this.str = "" + message;          
           
            this.CancelGesture(this.str);

            console.log(this.str);

        });

         // Prop Interaction
         this.room.AddMessageHandler("attachProp", (message) => {
        
            this.str = "" + message;

            this.AttachProp(this.str);

            console.log(this.str);

        });


         // Report State
         this.room.AddMessageHandler("reportState", (message) => {

         
            this.ResponseReportStateMessage(this.currentlyAttachedProp + "@@" + this.currentlyAppliedGestureAnimationClip);

            
        });

        this.room.AddMessageHandler("responseToReportState", (message) => {
                    
            this.str = "" + message;

            this.SetReportedState(this.str);

            console.log(this.str);

        });

        console.log("ClientStarter Delayed Start");


        this.SendReportStateMessage("");

        yield new UnityEngine.WaitForSeconds(1);

        if (this.isFirst) {
            this.isFirst = false;
        }


    }
    private isFirst: bool = true;
    public SetReportedState(str: string) {

        if (this.isFirst) {
        
            const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(str.split("@@")[0]);           

            this.AttachProp(str.split("@@")[0] + "@@" + str.split("@@")[1]);

            this.SetGesture(str.split("@@")[0] + "@@" + str.split("@@")[2]);
            
        }

    }


    public CancelGesture(str: string) {

        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(str.split("@@")[0]);

        zepetoPlayer.character.CancelGesture();

    }


    private currentlyAppliedGestureAnimationClip: string;
    public SetGesture(str: string) {

        // value 100 means teleport without gesture
        if (str.split("@@")[1] != "100" && str.split("@@")[1] != "undefined") {

            const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(str.split("@@")[0]);

            if (ZepetoPlayers.instance.LocalPlayer.zepetoPlayer == zepetoPlayer) {

                this.currentlyAppliedGestureAnimationClip = str.split("@@")[1];

            }          

            console.log(str.split("@@")[1]+"!!!!!!!!!!!!!!!!!!!");

            zepetoPlayer.character.SetGesture(this.animationClip[parseInt(str.split("@@")[1])])

        }
       
    }


    private str: string;
    *TryTeleport(str: string) {

        yield new UnityEngine.WaitForSeconds(0.12);

        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(str.split("@@")[0]);
       
        zepetoPlayer.character.transform.position = new UnityEngine.Vector3(parseFloat(str.split("@@")[2]), parseFloat(str.split("@@")[3]), parseFloat(str.split("@@")[4]));
        zepetoPlayer.character.transform.rotation = new UnityEngine.Quaternion(parseFloat(str.split("@@")[5]), parseFloat(str.split("@@")[6]), parseFloat(str.split("@@")[7]), parseFloat(str.split("@@")[8]));

        yield new UnityEngine.WaitForSeconds(0.2);
      
    }




    public interactionProp: UnityEngine.GameObject[];
    private currentlyAttachedProp: string;
    private propToAttach: UnityEngine.GameObject;
    public AttachProp(str: string) {

        if (str.split("@@")[1] != "undefined") {

            const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(str.split("@@")[0]);
            console.log(str);

            // 0 = guitar
            if (str.split("@@")[1] == "0") {

                if (ZepetoPlayers.instance.LocalPlayer.zepetoPlayer == zepetoPlayer) {

                    this.currentlyAttachedProp = str.split("@@")[1];

                }

                this.propToAttach = UnityEngine.GameObject.Instantiate<UnityEngine.GameObject>(this.interactionProp[0]);

                this.propToAttach.transform.parent = zepetoPlayer.character.transform.GetChild(0).GetChild(1).GetChild(2);

                this.propToAttach.transform.localPosition = new UnityEngine.Vector3(-0.255, 0.019, -0.097);

                console.log("pos set");

                this.propToAttach.transform.localRotation = UnityEngine.Quaternion.Euler(new UnityEngine.Vector3(-86.264, 18.353, 79.142));

                console.log("rot set");

            }

        }


    }




    // 일정 Interval Time으로 내(local)캐릭터 transform을 server로 전송합니다.
    private* SendMessageLoop(tick: number) {
        while (true) {
            yield new UnityEngine.WaitForSeconds(tick);

            if (this.room != null && this.room.IsConnected) {
                const hasPlayer = ZepetoPlayers.instance.HasPlayer(this.room.SessionId);
                if (hasPlayer) {
                    const myPlayer = ZepetoPlayers.instance.GetPlayer(this.room.SessionId);
                    if (myPlayer.character.CurrentState != CharacterState.Idle)
                        this.SendTransform(myPlayer.character.transform);
                }
            }
        }
    }

    private OnStateChange(state: State, isFirst: boolean) {

        // 첫 OnStateChange 이벤트 수신 시, State 전체 스냅샷을 수신합니다.
        if (isFirst) {

            // [CharacterController] (Local)Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
                const myPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;

                myPlayer.character.OnChangedState.AddListener((cur, prev) => {
                    this.SendState(cur);
                });
            });

            // [CharacterController] Player 인스턴스가 Scene에 완전히 로드되었을 때 호출
            ZepetoPlayers.instance.OnAddedPlayer.AddListener((sessionId: string) => {
                const isLocal = this.room.SessionId === sessionId;
                if (!isLocal) {
                    const player: Player = this.currentPlayers.get(sessionId);

                    // [RoomState] player 인스턴스의 state가 갱신될 때마다 호출됩니다.
                    player.OnChange += (changeValues) => this.OnUpdatePlayer(sessionId, player);
                }
            });
        }

        let join = new Map<string, Player>();
        let leave = new Map<string, Player>(this.currentPlayers);

        state.players.ForEach((sessionId: string, player: Player) => {
            if (!this.currentPlayers.has(sessionId)) {
                join.set(sessionId, player);
            }
            leave.delete(sessionId);
        });

        // [RoomState] Room에 입장한 player 인스턴스 생성
        join.forEach((player: Player, sessionId: string) => this.OnJoinPlayer(sessionId, player));

        // [RoomState] Room에서 퇴장한 player 인스턴스 제거
        leave.forEach((player: Player, sessionId: string) => this.OnLeavePlayer(sessionId, player));
    }

    private OnJoinPlayer(sessionId: string, player: Player) {
        console.log(`[OnJoinPlayer] players - sessionId : ${sessionId}`);
        this.currentPlayers.set(sessionId, player);

        const spawnInfo = new SpawnInfo();
        const position = this.ParseVector3(player.transform.position);
        const rotation = this.ParseVector3(player.transform.rotation);
        spawnInfo.position = position;
        spawnInfo.rotation = UnityEngine.Quaternion.Euler(rotation);

        const isLocal = this.room.SessionId === player.sessionId;
        ZepetoPlayers.instance.CreatePlayerWithUserId(sessionId, player.zepetoUserId, spawnInfo, isLocal);
        
    }

    private OnLeavePlayer(sessionId: string, player: Player) {
        console.log(`[OnRemove] players - sessionId : ${sessionId}`);
        this.currentPlayers.delete(sessionId);

        ZepetoPlayers.instance.RemovePlayer(sessionId);
    }

    private OnUpdatePlayer(sessionId: string, player: Player) {

        const position = this.ParseVector3(player.transform.position);

        const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(sessionId);
        zepetoPlayer.character.MoveToPosition(position);

        if (player.state === CharacterState.JumpIdle || player.state === CharacterState.JumpMove){
            zepetoPlayer.character.Jump();          
        }
            

    }

    private SendTransform(transform: UnityEngine.Transform) {
        const data = new RoomData();

        const pos = new RoomData();
        pos.Add("x", transform.localPosition.x);
        pos.Add("y", transform.localPosition.y);
        pos.Add("z", transform.localPosition.z);
        data.Add("position", pos.GetObject());

        const rot = new RoomData();
        rot.Add("x", transform.localEulerAngles.x);
        rot.Add("y", transform.localEulerAngles.y);
        rot.Add("z", transform.localEulerAngles.z);
        data.Add("rotation", rot.GetObject());
        this.room.Send("onChangedTransform", data.GetObject());
    }

    private SendState(state: CharacterState) {
        const data = new RoomData();
        data.Add("state", state);
        this.room.Send("onChangedState", data.GetObject());        
    }

    private ParseVector3(vector3: Vector3): UnityEngine.Vector3 {
        return new UnityEngine.Vector3
        (
            vector3.x,
            vector3.y,
            vector3.z
        );
    }


    public SendTeleportMessage(message) {

        this.room.Send("onTeleport", message);
        console.log(message.toString() + "sent");
    }


    public SendSetGestureMessage(message) {

        this.room.Send("onSetGesture", message);
        console.log(message.toString() + "sent");
    }

    public SendCancelGestureMessage() {

        this.room.Send("onCancelGesture");
        console.log("sent");
    }

    public SendAttachPropMessage(message) {

        this.room.Send("attachProp", message);
        console.log(message.toString() + "sent");

    }

    // Report
    public SendReportStateMessage(message) {

        this.room.Send("reportState", message);
        console.log(message.toString() + "sent");

    }

    public ResponseReportStateMessage(message) {

        this.room.Send("responseToReportState", message);
        console.log(message.toString() + "sent");

    }
}