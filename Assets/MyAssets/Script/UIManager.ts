
import { GameObject, RectTransform, Time, Vector3, WaitForSeconds } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'

export default class UIManager extends ZepetoScriptBehaviour {

    private isUIExpanding: bool;
    private isUIReducing: bool;
    Start() {    

    }


    // type 1 : whole scale
    // type 2 : vertical
    // type 3 : horizontal
    public *PopupUI(target: GameObject, type: number) {

        if (!this.isUIExpanding) {

            this.isUIExpanding = true;        
            
            target.GetComponent<RectTransform>().localScale = new Vector3(0, 0, 0)


            switch (type) {

                case 1:

                    target.GetComponent<RectTransform>().localScale = new Vector3(0, 0, 0);
                    target.SetActive(true);

                    while (target.GetComponent<RectTransform>().localScale.x < 0.99) {

                        target.GetComponent<RectTransform>().localScale = Vector3.Lerp(target.GetComponent<RectTransform>().localScale, new Vector3(1, 1, 1), Time.deltaTime * 8);

                        yield new WaitForSeconds(Time.deltaTime/3);

                    }

                    break;

                case 2:

                    target.GetComponent<RectTransform>().localScale = new Vector3(1, 0, 0);
                    target.SetActive(true);

                    while (target.GetComponent<RectTransform>().localScale.y < 0.99) {

                        target.GetComponent<RectTransform>().localScale = Vector3.Lerp(target.GetComponent<RectTransform>().localScale, new Vector3(1, 1, 1), Time.deltaTime * 8);

                        yield new WaitForSeconds(Time.deltaTime/3);

                    }

                    break;

                case 3:

                    target.GetComponent<RectTransform>().localScale = new Vector3(0, 1, 0);
                    target.SetActive(true);

                    while (target.GetComponent<RectTransform>().localScale.x < 0.99) {

                        target.GetComponent<RectTransform>().localScale = Vector3.Lerp(target.GetComponent<RectTransform>().localScale, new Vector3(1, 1, 1), Time.deltaTime * 8);

                        yield new WaitForSeconds(Time.deltaTime/3);

                    }

                    break;


                default:
            }         

            console.log("Popup Animation END")

            this.isUIExpanding = false;

        }        
    }



    public *HideUI(target: GameObject) {

        if (!this.isUIReducing) {
        
            this.isUIReducing = true;

            target.GetComponent<RectTransform>().localScale = new Vector3(1, 1, 1)

            while (target.GetComponent<RectTransform>().localScale.x > 0.01 && !this.isUIExpanding) {

                target.GetComponent<RectTransform>().localScale = Vector3.Lerp(target.GetComponent<RectTransform>().localScale, new Vector3(0, 0, 0), Time.deltaTime * 12);

                yield new WaitForSeconds(Time.deltaTime/3);
            }

            console.log("Hide Animation END");

            target.SetActive(false);

            this.isUIReducing = false;

        }       
    }

}