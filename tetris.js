

document.addEventListener("DOMContentLoaded", init, true);
document.onkeydown = trackkeys;

window.addEventListener("resize", resizecontrol);

num_x = 14; //number of columns;
num_y = 20; //number of rows;

tiles = new Array();

current_tile = {};

//field = new Array(num_x*num_y);

field = [];

for(var i = 0;i < num_y;i++){
  field[i] = new Array(num_x);
}

/*for(var i = 0;i < num_y;i++){
  for(var j = 0;j < num_x;j++){
    field[i][j] = 0;
  }
}*/

uf = setInterval(updateField, 100);
block_uf = false;
ltfd = setInterval(letTilesFallDown, 1000);
block_ltfd = false;

blockcolors = [];

function Block (id, position, color){ //class prototype for any block
    var structure = [[[0,0,0,0], [0,0,0,0], [0,0,0,0],[0,0,0,0]], // Every block has 4 states for every possible rotation possition
                     [[0,0,0,0], [0,0,0,0], [0,0,0,0],[0,0,0,0]], // The array structure gives information about which parts of an 4x4 block
                     [[0,0,0,0], [0,0,0,0], [0,0,0,0],[0,0,0,0]], // are filled with "block material", respectively defining which type of block
                     [[0,0,0,0], [0,0,0,0], [0,0,0,0],[0,0,0,0]]]; // is stored in the Block

    blockstate = 0;

    switch(id){
      case 0:
      //block form:
      // [][][][]
        structure[0] = [[1,1,1,1], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
        structure[1] = [[1,0,0,0], [1,0,0,0], [1,0,0,0], [1,0,0,0]];
        structure[2] = [[1,1,1,1], [0,0,0,0], [0,0,0,0], [0,0,0,0]];
        structure[3] = [[1,0,0,0], [1,0,0,0], [1,0,0,0], [1,0,0,0]];
        break;
      case 1:
      //block form:
      // [][][]
      // []
        structure[0] = [[1,0,0,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]];
        structure[1] = [[0,1,0,0], [0,1,0,0], [1,1,0,0], [0,0,0,0]];
        structure[2] = [[1,1,1,0], [0,0,1,0], [0,0,0,0], [0,0,0,0]];
        structure[3] = [[1,1,0,0], [1,0,0,0], [1,0,0,0], [0,0,0,0]];
        break;
      case 2:
      //block form:
      // []
      // [][][]
        structure[0] = [[1,1,1,0], [1,0,0,0], [0,0,0,0], [0,0,0,0]];
        structure[1] = [[1,0,0,0], [1,0,0,0], [1,1,0,0], [0,0,0,0]];
        structure[2] = [[0,0,1,0], [1,1,1,0], [0,0,0,0], [0,0,0,0]];
        structure[3] = [[1,1,0,0], [0,1,0,0], [0,1,0,0], [0,0,0,0]];
        break;
      case 3:
      //block form:
      // [][]
      // [][]
        structure[0] = [[1,1,0,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]];
        structure[1] = [[1,1,0,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]];
        structure[2] = [[1,1,0,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]];
        structure[3] = [[1,1,0,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]];
        break;
      case 4:
      //block form:
      // [][]
      //   [][]
        structure[0] = [[0,1,1,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]];
        structure[1] = [[1,0,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]];
        structure[2] = [[0,1,1,0], [1,1,0,0], [0,0,0,0], [0,0,0,0]];
        structure[3] = [[1,0,0,0], [1,1,0,0], [0,1,0,0], [0,0,0,0]];
        break;

      case 5:
      // block form:
      //   [][]
      // [][]
        structure[0] = [[1,1,0,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]];
        structure[1] = [[0,1,0,0], [1,1,0,0], [1,0,0,0], [0,0,0,0]];
        structure[2] = [[1,1,0,0], [0,1,1,0], [0,0,0,0], [0,0,0,0]];
        structure[3] = [[0,1,0,0], [1,1,0,0], [1,0,0,0], [0,0,0,0]];
        break;

      case 6:
      //block form:
      //   []
      // [][][]
        structure[0] = [[1,1,1,0], [0,1,0,0], [0,0,0,0], [0,0,0,0]];
        structure[1] = [[1,0,0,0], [1,1,0,0], [1,0,0,0], [0,0,0,0]];
        structure[2] = [[0,0,0,0], [0,1,0,0], [1,1,1,0], [0,0,0,0]];
        structure[3] = [[0,0,1,0], [0,1,1,0], [0,0,1,0], [0,0,0,0]];
        break;
      default: //error
        structure = [[1,1,1,1], [1,1,1,1], [1,1,1,1], [1,1,1,1]];
    }

    this.position = position;
    this.structure = structure;
    this.blockstate = blockstate;
    this.color = color;
    this.blocked = false;
}

function init(){

  for(var i = 0;i < 7;i++) // define colors for every block type
    blockcolors[i] = getrandomcolor();

  resizecontrol();
  addTiles();
}

function addTiles() { // part of the init, prepared the DOM Elements of the website

  var ctrlwindowl = document.querySelector("#controlwindow_left");

  var ctrlw_width = ctrlwindowl.style.width;
  ctrlw_width = ctrlw_width.substring(0,ctrlw_width.length - 2);
  var ctrlw_height = ctrlwindowl.style.height;
  ctrlw_height = ctrlw_height.substring(0,ctrlw_height.length - 2);


  for(var i = 0;i < num_x*num_y;i++){
    var tile = document.createElement("div");
    tile.style.border = "1px black solid";
    tile.style.position = "absolute";
    tile.style.left = (i % num_x)*((ctrlw_width / num_x) - 1) + "px";
    tile.style.top = Math.floor(i / num_x)*((ctrlw_height / num_y) - 1) + "px";
    tile.style.width = (ctrlw_width / num_x) - 1 + "px"; //-1 because of border
    tile.style.height = (ctrlw_height / num_y) - 1 + "px"; // -1 because of border
    tile.id = "tile" + i;
    ctrlwindowl.appendChild(tile);
  }

}

function resizecontrol(){ // function for resizing the browser window
  var ctrlwindow = document.querySelector("#controlwindow");
  var ctrlwindowl = document.querySelector("#controlwindow_left");
  var ctrlwindowr = document.querySelector("#controlwindow_right");

  ctrlwindowl.style.width = 0.7*window.innerHeight;
  ctrlwindowl.style.height = window.innerHeight;

  ctrlwindowr.style.width = 0.3*window.innerHeight;
  ctrlwindowr.style.height = window.innerHeight;
  ctrlwindowr.style.left = 0.7*window.innerHeight;

  ctrlwindow.style.width = window.innerHeight;
  ctrlwindow.style.height = window.innerHeight;

  updateTilePosition();
}

function updateTilePosition(){ //part of the resize control

  var ctrlwindowl = document.querySelector("#controlwindow_left");

  var ctrlw_width = ctrlwindowl.style.width;
  ctrlw_width = ctrlw_width.substring(0,ctrlw_width.length - 2);
  var ctrlw_height = ctrlwindowl.style.height;
  ctrlw_height = ctrlw_height.substring(0,ctrlw_height.length - 2);


  for(var i = 0;i < num_x*num_y;i++){
    try{
    var tile = document.querySelector("div#tile" + i);
    tile.style.left = (i % num_x)*((ctrlw_width / num_x) - 1) + "px";
    tile.style.top = Math.floor(i / num_x)*((ctrlw_height / num_y) - 1) + "px";
    tile.style.width = (ctrlw_width / num_x) - 1 + "px"; //-1 because of border
    tile.style.height = (ctrlw_height / num_y) - 1 + "px"; // -1 because of border
    } catch(TypeError){
          return;
    }
  }

}

function updateField(){

  if(block_uf == true)
    return;

  var t = document.querySelectorAll('div[id*="tile"]');

  for(var i = 0;i < t.length;i++){ //redraw playfield white and set attributes to zero
    t[i].style.backgroundColor = "white";
    field[parseInt(i % num_x)][parseInt(i / num_x)] = 0;
  }


  for(var i = 0;i < tiles.length;i++){
    for(var x = 0;x < 4;x++){
      for(var y = 0;y < 4;y++){
        if(tiles[i].structure[tiles[i].blockstate][x][y] == 1){ //check the pieces of a block and set the tiles where pieces are located
          try{
            t[tiles[i].position[0] + num_x * tiles[i].position[1] + x + num_x * y].style.backgroundColor = tiles[i].color;
            field[tiles[i].position[0] + x][tiles[i].position[1] + y] = 1;
          }catch(TypeError){ }
        } else if(field[tiles[i].position[0] + x][tiles[i].position[1] + y] != 1){ //check if other block has already marked the field as set
          field[tiles[i].position[0] + x][tiles[i].position[1] + y] = 0;
        } else {}

      }
    }
  }

  //debug function
  /*for(var i = 0;i < field.length;i++){ //just for debugging
    if(field[parseInt(i % num_x)][parseInt(i / num_x)] == 1)
      t[i].style.backgroundColor = "red";
  }*/

  //check if new block should be created
  var getnewblock = true;

  for(var i = 0;i < tiles.length;i++){
    if(tiles[i].blocked == false)
      getnewblock = false;
  }

  if(getnewblock == true){
    checkIfLineCompleted();
    var n = parseInt(Math.random() * 7);
    tiles[tiles.length] = new Block(n, [parseInt(num_x / 2), -4], blockcolors[n]);
  }
  //end of new block check

}

function checkIfLineCompleted(){

  block_uf = true;
  block_ltfd = true;

  for(var y = 0;y < num_y;y++){
    var linecompleted = true;
    for(var x = 0;x < num_x;x++){ // check if any line is completed
      if(field[x][y] == 0)
        linecompleted = false;
    }
    if(linecompleted == true){ // delete detected complete line
      for(var i = 0;i < tiles.length;i++){
        for(var xx = 0;xx < 4;xx++){
          for(var yy = 0;yy < 4;yy++){
            if(tiles[i].position[1] + yy == y && tiles[i].structure[tiles[i].blockstate][xx][yy] == 1){ //delete tiles out of affected blocks
              tiles[i].structure[tiles[i].blockstate][xx][yy] = 0;
            }
          }
        }
      }
    }
  }

  block_uf = false;
  block_ltfd = false;

}

function letTilesFallDown(){

  if(block_ltfd == true)
    return;

  for(var i = 0;i < tiles.length;i++){
    for(var x = 0;x < 4; x++){
      for(var y = 0;y < 4;y++){

        if(tiles[i].blocked == false && tiles[i].structure[tiles[i].blockstate][x][y] == 1){
          if(field[tiles[i].position[0] + x][tiles[i].position[1] + y + 1] == 1 && (y == 3 || tiles[i].structure[tiles[i].blockstate][x][y + 1] == 0))
            tiles[i].blocked = true;
          if(tiles[i].position[1] + 1 + y >= num_y)
            tiles[i].blocked = true;
        }
      }
    }
    if(tiles[i].blocked == false){
      tiles[i].position = [tiles[i].position[0], tiles[i].position[1] + 1];
    }
  }
}

function moveTilesHor(direction){

  block_ltfd = true;
  block_uf = true;

    if(direction == "left"){

      allow_movement = true;

      for(var x = 0;x < 4;x++){
        for(var y = 0;y < 4;y++){
          try{
            if(field[tiles[tiles.length - 1].position[0] + x - 1][tiles[tiles.length - 1].position[1] + y] == 1 // check if tile next to block is occupied
                && tiles[tiles.length - 1].structure[tiles[tiles.length - 1].blockstate][x - 1][y] == 0) // and check if next tile is part of block
                  allow_movement = false;
          } catch(TypeError){ allow_movement = false;}
        }
      }

      if(tiles[tiles.length - 1].position[0] > 0
          && tiles[tiles.length - 1].blocked == false
          && allow_movement == true)
        tiles[tiles.length - 1].position[0] -= 1;

    }
    if(direction == "right"){

      allow_movement = true;

      debugstr = "";
      debugstr2 = "";

      for(var x = 0;x < 4;x++){
        for(var y = 0;y < 4;y++){
          try{
          if(field[tiles[tiles.length - 1].position[0] + x + 1][tiles[tiles.length - 1].position[1] + y] == 1 //check if tile next to block is occupied
              && tiles[tiles.length - 1].structure[tiles[tiles.length - 1].blockstate][x + 1][y] == 0) // and check if next tile is part of block
                allow_movement = false;
          } catch(TypeError) { allow_movement = false;}
        }
      }


      if(tiles[tiles.length - 1].position[0] < num_x - 2
          && tiles[tiles.length - 1].blocked == false
          && allow_movement == true)
        tiles[tiles.length - 1].position[0] += 1;

    }

    block_ltfd = false;
    block_uf = false;
}

function rotateTile(direction){

    block_uf = true;
    block_ltfd = true;

    var current_tile = tiles[tiles.length - 1]

    if(current_tile.blocked == true)
      return;

    var allow_rotation = true;

    var newstructure = current_tile.structure[(current_tile.blockstate + 1) % 4];

    for(var x = 0;x < 4;x++){
      for(var y = 0;y < 4;y++){

        //abort rotation if object is in the way or block would rotate out of gamefield
        if(newstructure[x][y] == 1){ //check if rotation can be allowed
          if(field[current_tile.position[0] + x][current_tile.position[1] + y] == 1 && current_tile.structure[x][y] == 0)
            allow_rotation = false;

          if(current_tile.position[0] + x >= num_x || current_tile.position[0] + x < 0) //check limits in horizontal direction
            allow_rotation = false;

          if(current_tile.position[1] + y >= num_y) //check limit in vertical direction
            allow_rotation = false;
        }

      }
    }

    if(allow_rotation == true){
        tiles[tiles.length - 1].blockstate = (tiles[tiles.length - 1].blockstate + 1) % 4;
    }

    block_uf = false;
    block_ltfd = false;
}

function trackkeys(e) {

  var key;

  if(!e) {
    e = window.event;
  }
  if(e.which) {
    key = e.which;
  }
  else if(e.keyCode) {
    key = e.keyCode;
  }

  switch(key) {

      case 37: { // move to the left
          moveTilesHor("left");
          break;
      }
      case 38: { // rotate clockwise
          if(tiles[tiles.length - 1].blocked == false)
            rotateTile();
          break;
      }

      case 39:{ // move to the right
          moveTilesHor("right");
          break;
      }

      case 40:{ //let tile drop faster
          letTilesFallDown();
          break;
      }

      case 13:{ // reload the page
          window.location.reload();
          break;
      }

      default:

  }

}

function getrandomcolor () { //create default colors for each block

  //var ch = new Array("0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F");
  var ch = new Array("0","1","2","3","4","5","6","7","8","9");

  var cl = new Array(6);

  for(var a = 0;a < 6;a++) {
  cl[a] = ch[Math.floor(Math.random() * 10)];
  }

  return "#" + cl[0] + cl[1] + cl[2] + cl[3] + cl[4] + cl[5];
}
