//property, display, confirmwindow


// 色々な設定項目
const property = new Object();
property.num_phase = 12;
property.num_shape = 5;
property.learning_rate = 1/8/2;
property.colorOfCpu = -1;
property.num_readnode = 0;
property.depth = 4;
property.depth_last = 12;
property.alpha = -100;
property.beta = 100;
property.clickDisabled = false;
property.player_state_pass = false;
property.touchcount = 0;
property.eventName = "mouseup";
property.mode = "black";


// domのオブジェクトを保持
const display = new Object();
display.squares = new Array();
display.circles = new Array();
display.black_score = document.getElementById("black_score");
display.white_score = document.getElementById("white_score");
display.comment = document.getElementById("comment");
display.board = document.getElementById("board");
display.pass = document.getElementById("pass");
display.switch = document.getElementById("switch_colors");





//detect touch screen
for(const name of ["iPhone", "Android", "Mobile", "iPad"]){
	if(navigator.userAgent.indexOf(name)!==-1){
		property.eventName = "touchend";
		break;
	}
}


//generate reversi board
const reversiBoard = document.getElementById("test");
for(let i=0;i<8;i++){
	const row = document.createElement("div");
	for(let i=0;i<8;i++){
		const box = document.createElement("div");
		const div = document.createElement("div");
		box.classList.add("board_box");
		row.classList.add("board_row");
		row.appendChild(box);
		box.appendChild(div);
		box.style.display = "inline-block";
		display.squares.push(box);
		display.circles.push(div);
	}
	reversiBoard.appendChild(row);
}


//add eventlistener to each cell
for(let i=0;i<8;i++){
	for(let j=0;j<8;j++){
		const e = i*8 + j;
		display.squares[e].addEventListener(property.eventName, ()=>{
			if(property.clickDisabled){
				return;
			}
			if(property.player_state_pass){
				return;
			}
			// game mode
			if(property.mode==="black" || property.mode==="white"){
				property.clickDisabled = true;
				master.play(i<4?1<<(31-e):0, i<4?0:1<<(63-e))
				.then(()=>{
					property.clickDisabled = false;
				});
			}
			// setup mode
			else if(property.mode="setup"){
				const board = master.board_temp.board;
				if(board[e]===1) board[e] = -1;
				else if(board[e]===-1) board[e] = 0;
				else board[e] = 1;
				master.board_temp.setBoard = board;
				master.render(master.board_temp);
			}
		});
	}
}


//detect 3-times-touch and go to kaihatsu-mode
display.comment.addEventListener(property.eventName, e=>{
	e.preventDefault();
	property.touchcount++;
	setTimeout(()=>{property.touchcount--;}, 600);
	if(property.touchcount>=3){
		const comment_text = display.comment.innerText;
		display.comment.innerText = "開発モード";
		property.touchcount = -1e9;
		setTimeout(() => {
			display.comment.innerText = comment_text;
			property.touchcount = 0;
		}, 3000);

		document.getElementById("footer3").style.display = "block";
	}
});

//on pulldown menu changed (depth)
document.getElementById("search_depth").addEventListener("change", e=>{
	const value = e.target.value.split("/").map(x=>parseInt(x));
	property.depth = value[0];
	property.depth_last = value[1];
	property.alpha = value[2];
	property.beta = value[3];
});

//pass button
document.getElementById("pass").addEventListener(property.eventName, e=>{
	if(property.player_state_pass){
		display.pass.style.display = "none";
		property.player_state_pass = false;
		master.play();
	}
});

//undo button
document.getElementById("undo").addEventListener(property.eventName, e=>{
	master.undo();
});

//restart button
document.getElementById("restart").addEventListener(property.eventName, e=>{
	confirmWindow(()=>{
		property.mode = "black";
		master.restart();
	}, ()=>{}, "restart game?");
});

//switch button
document.getElementById("switch").addEventListener(property.eventName, ()=>{
	if(property.mode==="black"){
		property.mode = "white";
		property.colorOfCpu = 1;
		master.play();
	}
	else if(property.mode==="white"){
		property.mode = "black";
		property.colorOfCpu = -1;
		master.play();
	}
});

//setup button
document.getElementById("setup").addEventListener(property.eventName, ()=>{
	if(property.mode!=="setup"){
		master.board_temp = new BOARD(master.now);
		property.mode = "setup";
		display.comment.innerText = "setup mode";
		master.render(master.board_temp);
	}else{
		master.record = [master.board_temp];
		confirmWindow(()=>{
			property.mode = "black";
			master.render();
			master.showMove();
		},()=>{},"black turn?")
	}
});

//restart button
document.getElementById("disp_reset").addEventListener(property.eventName, e=>{
});

//pass button
window.addEventListener("resize", ()=>{
});

//evaluate boardd
document.getElementById("evaluate").addEventListener(property.eventName, e=>{
	master.showEval(master.now, property.alpha, property.beta);
});






