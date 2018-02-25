export function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive 
}
export const inRange=function(array,min,max){
    let inRange = array.filter(value => value >= min && value <= max);
    //  post("<br>inRange original",array, " max ",max,"min",min,"inRange", inRange)
    return inRange;
};

export const randomDirection = function(wait){
    const direction=["north","south","east","west","none"];
    // if not provided a parameter, function returns only direction.
    var wall;
    if (wait===undefined){
        wall=getRandomInt(0, 3);
    } else {
        wall=getRandomInt(0, 4);
    }
    return direction[wall];
};
export function matchArray(array1,array2,valueCount){  //checks first 'valueCount' array members.
    var truth=true;
    for(let i=0; i<valueCount; i++){
        if (array1[i]!==array2[i]){
            truth=false;
            break;
        }
    }
    return truth;
}
export var randRangeDistance = function (length){
    return getRandomInt(Math.floor(2*length/3),Math.floor(4*length/3));
};
export var arraySubtract = function(array, amount){
    var arraySubtract=[];
    array.map((item)=>arraySubtract.push(item-amount));
    return arraySubtract;
};
export var joinArrays = function (array1,array2){
    var output;
    array1 && array2 ?  
        output=array1.concat(array2) :
        array1 ? output=array1 
            : output = array2;
    return output;
};
export var doIt = function (count=1,callBack1,property,property2){
    for (var i=0; i<count; i++){
        callBack1(property,property2);
    }   
};

export function doOdds (num,denom, parameter, parameter2){ 
    //randomly returns parameters (callbacks) or ( true / false), based on odds 
   
    if (parameter===undefined){parameter=true; parameter2=false;}
    var odds=getRandomInt(1, denom+num);
    
    if (odds<=num){
        //      console.log("do odds",num,denom, parameter )
        return parameter; // or true...
    } else { //console.log("do odds returns", parameter2 )
        return parameter2; // or false...
        //      console.log("do odds",num,denom, parameter )           
    }
}
