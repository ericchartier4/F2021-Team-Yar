function Test(){
    console.log("testing testing 123");
}

function genCode(){
    let result = '';
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let digits = "123456789";
    for (i = 0; i<4; i++){
        let letterRand = Math.floor(Math.random() * 26); //returns a number between 0 and 25
        result += alphabet.charAt(letterRand);
    }
    for (i = 0; i<4; i++){
        let numberRand = Math.floor(Math.random() * 9); //returns a number between 0 and 8
        result += digits.charAt(numberRand);
    }

    //console.log(Math.random());
    console.log(result);
    return result;
}