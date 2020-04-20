// board		ボードを配列で返す
// setBoard		配列をボードにセット
// setBitBoard	ビットボードをセット
// getMove		着手可能位置をthis.l1とthis.l2に格納
// putStone		石を返す。this.currentturnを逆にして、this.sumofstonesに1を足す
// expand		expand children
// count		黒石ー白石の値を返す
// hash			returns hash value of board
// state		次の人が置けるなら1、次の人がパスなら2、終局なら3を返す
// swap			黒と白を入れ替える。
// black_white	石の差を求める
// shape		石の並びを配列で返す
// flip			盤面を左右反転
// rotate		盤面を90deg回転
// negaAlpha	現在の評価値を求める


//BOARD_DATA holds stone location, current turn, sum of stones
class BOARD {
	constructor(node){
		this.black1 = 0x00000008;
		this.black2 = 0x10000000;
		this.white1 = 0x00000010;
		this.white2 = 0x08000000;
		this.turn = 1;
		this.stones = 4;
		this.e = 0;

		if(node instanceof BOARD){
			this.black1 = node.black1;
			this.black2 = node.black2;
			this.white1 = node.white1;
			this.white2 = node.white2;
			this.turn = node.turn;
			this.stones = node.stones;
			this.e = node.e;
		}
	}

	
	get board(){
		const board = new Int8Array(64);
		
		for(let i=0;i<32;i++){
			if(this.black1&(1<<i)){
				board[31-i] = 1;
			}
		}
		for(let i=0;i<32;i++){
			if(this.black2&(1<<i)){
				board[63-i] = 1;
			}
		}
			
		for(let i=0;i<32;i++){
			if(this.white1&(1<<i)){
				board[31-i] = -1;
			}
		}
		for(let i=0;i<32;i++){
			if(this.white2&(1<<i)){
				board[63-i] = -1;
			}
		}
		return board;
	}
	
	setBitBoard(arr){
		if(!arr.length){
			throw 'argment object may not be a array';
		}
		if(arr.length!==6){
			throw 'length of array doesnt match bit board';
		}
		if((arr[0]&arr[2])|(arr[1]&arr[3])){
			throw 'invalid fboard data';
		}
		
		this.black1 = arr[0];
		this.black2 = arr[1];
		this.white1 = arr[2];
		this.white2 = arr[3];
		
		if(arr[4]===-1){
			this.turn = -1;
		}else{
			this.turn = 1;
		}

		let num_stones = 0;
		for(let j=0;j<32;j++){
			if(this.black1&(1<<j)){
				num_stones++;
			}
			if(this.black2&(1<<j)){
				num_stones++;
			}
			if(this.white1&(1<<j)){
				num_stones++;
			}
			if(this.white2&(1<<j)){
				num_stones++;
			}
		}

		this.stones = num_stones;
	}

	set setBoard(arr_){
		const arr = new Int8Array(64);
		
		//reset board array
		this.black1 = this.black2 = this.white1 = this.white2 = 0;
		
		for(let i=0;i<64;i++){
			if(arr_[i]===1){
				arr[i] = 1;
			}else{
				arr[i] = 0;
			}
		}

		//set black stone
		for(let i=0;i<32;i++){
			this.black1 |= arr[31-i]<<i;
			this.black2 |= arr[63-i]<<i
		}
		

		for(let i=0;i<64;i++){
			if(arr_[i]===-1){
				arr[i] = 1;
			}else{
				arr[i] = 0;
			}
		}

		//set white stone
		for(let i=0;i<32;i++){
			this.white1 |= arr[31-i]<<i;
			this.white2 |= arr[63-i]<<i;
		}

		let num_stones = 0;
		for(let j=0;j<32;j++){
			if(this.black1&(1<<j)){
				num_stones++;
			}
			if(this.black2&(1<<j)){
				num_stones++;
			}
			if(this.white1&(1<<j)){
				num_stones++;
			}
			if(this.white2&(1<<j)){
				num_stones++;
			}
		}

		this.stones = num_stones;

		this.turn = 1;
	}

	putStone(hand1, hand2){
		let black1 = this.black1;
		let black2 = this.black2;
		let white1 = this.white1;
		let white2 = this.white2;
		
		let temp1, temp2;
	
		if(this.turn===-1){//white turn
			let temp = white1;
			white1 = black1;
			black1 = temp;
			temp = white2;
			white2 = black2;
			black2 = temp;
		}
		
		const horizontalMask1 = 0x7e7e7e7e & white1;
		const horizontalMask2 = 0x7e7e7e7e & white2;
		const verticalMask1 = 0x00ffffff & white1;
		const verticalMask2 = 0xffffff00 & white2;
		const edgeMask1 = 0x007e7e7e & white1;
		const edgeMask2 = 0x7e7e7e00 & white2;
		
	
	
	
		//+1
		temp1  = horizontalMask1 & (hand1<<1); temp2  = horizontalMask2 & (hand2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		temp1 |= horizontalMask1 & (temp1<<1); temp2 |= horizontalMask2 & (temp2<<1);
		if(((temp1<<1)&black1)|((temp2<<1)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
	
	
		//-1
		temp1  = horizontalMask1 & (hand1>>>1); temp2  = horizontalMask2 & (hand2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		temp1 |= horizontalMask1 & (temp1>>>1); temp2 |= horizontalMask2 & (temp2>>>1);
		if(((temp1>>>1)&black1)|((temp2>>>1)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
	
		
	
		//+8
		temp1  = verticalMask1&(hand1>>>8);
		temp1 |= verticalMask1&(temp1>>>8);
		temp1 |= verticalMask1&(temp1>>>8);
		temp2  = verticalMask2&(hand2>>>8|temp1<<24|hand1<<24);
		temp2 |= verticalMask2&(temp2>>>8);
		temp2 |= verticalMask2&(temp2>>>8);
		if(((temp1>>>8)&black1)|((temp2>>>8|temp1<<24)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
	
		//-8
		temp2  = verticalMask2&(hand2<<8);
		temp2 |= verticalMask2&(temp2<<8);
		temp2 |= verticalMask2&(temp2<<8);
		temp1  = verticalMask1&(hand1<<8|temp2>>>24|hand2>>>24);
		temp1 |= verticalMask1&(temp1<<8);
		temp1 |= verticalMask1&(temp1<<8);
		if(((temp1<<8|temp2>>>24)&black1)|((temp2<<8)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
		
		//-7
		temp2  = edgeMask2&(hand2<<7);
		temp2 |= edgeMask2&(temp2<<7);
		temp2 |= edgeMask2&(temp2<<7);
		temp1  = edgeMask1&(hand1<<7|temp2>>>25|hand2>>>25);
		temp1 |= edgeMask1&(temp1<<7);
		temp1 |= edgeMask1&(temp1<<7);
		if(((temp1<<7|temp2>>>25)&black1)|((temp2<<7)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
		
		
		//-9
		temp2  = edgeMask2&(hand2<<9);
		temp2 |= edgeMask2&(temp2<<9);
		temp2 |= edgeMask2&(temp2<<9);
		temp1  = edgeMask1&(hand1<<9|temp2>>>23|hand2>>>23); 
		temp1 |= edgeMask1&(temp1<<9);
		temp1 |= edgeMask1&(temp1<<9);
		if(((temp1<<9|temp2>>>23)&black1)|((temp2<<9)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
		
		//+7
		temp1  = edgeMask1&(hand1>>>7);
		temp1 |= edgeMask1&(temp1>>>7);
		temp1 |= edgeMask1&(temp1>>>7);
		temp2  = edgeMask2&(hand2>>>7|temp1<<25|hand1<<25);
		temp2 |= edgeMask2&(temp2>>>7);
		temp2 |= edgeMask2&(temp2>>>7);
		if(((temp1>>>7)&black1)|((temp2>>>7|temp1<<25)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
		
		//+9
		temp1  = edgeMask1&(hand1>>>9);
		temp1 |= edgeMask1&(temp1>>>9);
		temp1 |= edgeMask1&(temp1>>>9);
		temp2  = edgeMask2&(hand2>>>9|temp1<<23|hand1<<23);
		temp2 |= edgeMask2&(temp2>>>9);
		temp2 |= edgeMask2&(temp2>>>9);
		if(((temp1>>>9)&black1)|((temp2>>>9|temp1<<23)&black2)){
			black1 ^= temp1; black2 ^= temp2;
			white1 ^= temp1; white2 ^= temp2;
		}
	
		black1 |= hand1;
		black2 |= hand2;
	
		if(this.turn===-1){//white turn
			let temp = white1;
			white1 = black1;
			black1 = temp;
			temp = white2;
			white2 = black2;
			black2 = temp;
		}

		const child = new BOARD(this);

		child.black1 = black1;
		child.black2 = black2;
		child.white1 = white1;
		child.white2 = white2;
		child.turn = -this.turn;
		child.stones = this.stones + 1;
		
		return child;
	}
	
	getMove(){
		let p1, p0, o1, o0;
		if(this.turn===1){
			p1 = this.black1;
			p0 = this.black2;
			o1 = this.white1;
			o0 = this.white2;
		}else{
			p1 = this.white1;
			p0 = this.white2;
			o1 = this.black1;
			o0 = this.black2;
		}

		let mob1 = 0;
		let mob0 = 0;

		let blank1 = ~(p1 | o1);
		let blank0 = ~(p0 | o0);

		let mo1 = o1 & 0x7e7e7e7e;
		let mo0 = o0 & 0x7e7e7e7e;

		// 右向き

		let ps1 = p1 << 1;
		let ps0 = p0 << 1;

		mob1 = (mo1 + ps1) & blank1 & ~ps1;
		mob0 = (mo0 + ps0) & blank0 & ~ps0;

		// 左向き

		let t0 = p0 >>> 1 & mo0;
		t0 |= t0 >>> 1 & mo0;
		t0 |= t0 >>> 1 & mo0;
		t0 |= t0 >>> 1 & mo0;
		t0 |= t0 >>> 1 & mo0;
		t0 |= t0 >>> 1 & mo0;

		mob0 |= t0 >>> 1 & blank0;

		let t1 = p1 >>> 1 & mo1;
		t1 |= t1 >>> 1 & mo1;
		t1 |= t1 >>> 1 & mo1;
		t1 |= t1 >>> 1 & mo1;
		t1 |= t1 >>> 1 & mo1;
		t1 |= t1 >>> 1 & mo1;

		mob1 |= t1 >>> 1 & blank1;

		// 上下

		mo1 = o1 & 0x00ffffff;
		mo0 = o0 & 0xffffff00;

		// 下向き
		t0 = p0 << 8 & mo0;
		t0 |= t0 << 8 & mo0;
		t0 |= t0 << 8 & mo0;

		t1 = (p1 << 8 | (t0 | p0) >>> 24) & mo1;
		t1 |= t1 << 8 & mo1;
		t1 |= t1 << 8 & mo1;

		mob1 |= (t1 << 8 | t0 >>> 24) & blank1;
		mob0 |= t0 << 8 & blank0;

		// 上
		t1 = p1 >>> 8 & mo1;
		t1 |= t1 >>> 8 & mo1;
		t1 |= t1 >>> 8 & mo1;

		t0 = (p0 >>> 8 | (t1 | p1) << 24) & mo0;
		t0 |= t0 >>> 8 & mo0;
		t0 |= t0 >>> 8 & mo0;

		mob1 |= t1 >>> 8 & blank1;
		mob0 |= (t0 >>> 8 | t1 << 24) & blank0;

		// 斜め

		mo1 = o1 & 0x007e7e7e;
		mo0 = o0 & 0x7e7e7e00;

		// 右下
		t0 = p0 << 9 & mo0;
		t0 |= t0 << 9 & mo0;
		t0 |= t0 << 9 & mo0;

		t1 = (p1 << 9 | (t0 | p0) >>> 23) & mo1;
		t1 |= t1 << 9 & mo1;
		t1 |= t1 << 9 & mo1;

		mob1 |= (t1 << 9 | t0 >>> 23) & blank1;
		mob0 |= t0 << 9 & blank0;

		// 左上
		t1 = p1 >>> 9 & mo1;
		t1 |= t1 >>> 9 & mo1;
		t1 |= t1 >>> 9 & mo1;

		t0 = (p0 >>> 9 | (t1 | p1) << 23) & mo0;
		t0 |= t0 >>> 9 & mo0;
		t0 |= t0 >>> 9 & mo0;

		mob1 |= t1 >>> 9 & blank1;
		mob0 |= (t0 >>> 9 | t1 << 23) & blank0;

		// 左下
		t0 = p0 << 7 & mo0;
		t0 |= t0 << 7 & mo0;
		t0 |= t0 << 7 & mo0;

		t1 = (p1 << 7 | (t0 | p0) >>> 25) & mo1;
		t1 |= t1 << 7 & mo1;
		t1 |= t1 << 7 & mo1;

		mob1 |= (t1 << 7 | t0 >>> 25) & blank1;
		mob0 |= t0 << 7 & blank0;

		// 右上
		t1 = p1 >>> 7 & mo1;
		t1 |= t1 >>> 7 & mo1;
		t1 |= t1 >>> 7 & mo1;

		t0 = (p0 >>> 7 | (t1 | p1) << 25) & mo0;
		t0 |= t0 >>> 7 & mo0;
		t0 |= t0 >>> 7 & mo0;

		mob1 |= t1 >>> 7 & blank1;
		mob0 |= (t0 >>> 7 | t1 << 25) & blank0;

		return [mob1, mob0];
	}

	expand(){
		const children = [];
		let [move1, move2] = this.getMove();

		while(move1){
			const bit = -move1 & move1;
			//
			const child = this.putStone(bit, 0);
			children.push(child);
			//
			move1 ^= bit;
		}
		while(move2){
			const bit = -move2 & move2;
			//
			const child = this.putStone(0, bit);
			children.push(child);
			//
			move2 ^= bit;
		}
		return children;
	}

	state(){
		
		const [move1, move2] = this.getMove();
		
		if(move1|move2){
			return 1;
		}
		
		this.turn *= -1;
		const [move3, move4] = this.getMove();
		this.turn *= -1;
		
		if(move3|move4){
			return 2;
		}else{
			return 3;
		}
		
	}

	get hash(){

		let x = this.black1;
		x ^= x<<13;
		x ^= x>>>17;
		x ^= x<<15;
		
		x ^= this.black2;
		x ^= x<<13;
		x ^= x>>>17;
		x ^= x<<15;

		x ^= this.white1;
		x ^= x<<13;
		x ^= x>>>17;
		x ^= x<<15;

		x ^= this.white2;
		x ^= x<<13;
		x ^= x>>>17;
		x ^= x<<15;
		
		return x;
	}

	black_white(){

		let temp, sum = 0;

		temp = this.black1;
		temp = (temp&0x55555555) + ((temp>>>1)&0x55555555);
		temp = (temp&0x33333333) + ((temp>>>2)&0x33333333);
		temp = (temp&0x0f0f0f0f) + ((temp>>>4)&0x0f0f0f0f);
		temp = (temp&0x00ff00ff) + ((temp>>>8)&0x00ff00ff);
		temp = (temp&0x0000ffff) + ((temp>>>16)&0x0000ffff);
		sum += temp;

		temp = this.black2;
		temp = (temp&0x55555555) + ((temp>>>1)&0x55555555);
		temp = (temp&0x33333333) + ((temp>>>2)&0x33333333);
		temp = (temp&0x0f0f0f0f) + ((temp>>>4)&0x0f0f0f0f);
		temp = (temp&0x00ff00ff) + ((temp>>>8)&0x00ff00ff);
		temp = (temp&0x0000ffff) + ((temp>>>16)&0x0000ffff);
		sum += temp;
		

		return (sum<<1) - this.stones;
	}

	swap(){
		const newNode = new BOARD(this);

		newNode.black1 = this.white1;
		newNode.black2 = this.white2;
		newNode.white1 = this.black1;
		newNode.white2 = this.black2;
		newNode.turn *= -1;

		return newNode;
	}
	

	shape(){
		const black1 = this.black1;
		const black2 = this.black2;
		const white1 = this.white1;
		const white2 = this.white2;
		const b0 = (black1>>>24)&0xff, b1 = (black1>>>16)&0xff, b2 = (black1>>>8)&0xff, b3 = (black1>>>0)&0xff;
		const b4 = (black2>>>24)&0xff, b5 = (black2>>>16)&0xff, b6 = (black2>>>8)&0xff, b7 = (black2>>>0)&0xff;
		const w0 = (white1>>>24)&0xff, w1 = (white1>>>16)&0xff, w2 = (white1>>>8)&0xff, w3 = (white1>>>0)&0xff;
		const w4 = (white2>>>24)&0xff, w5 = (white2>>>16)&0xff, w6 = (white2>>>8)&0xff, w7 = (white2>>>0)&0xff;
		const list = new Array(40);
		let lineb = 0;
		let linew = 0;

		//horizontal 1
		//上辺
		list[0] = b0;
		list[1] = w0;
		//下辺
		list[2] = b7;
		list[3] = w7;
		//右辺
		lineb = ((b7&1)<<0)|((b6&1)<<1)|((b5&1)<<2)|((b4&1)<<3)|((b3&1)<<4)|((b2&1)<<5)|((b1&1)<<6)|((b0&1)<<7);
		linew = ((w7&1)<<0)|((w6&1)<<1)|((w5&1)<<2)|((w4&1)<<3)|((w3&1)<<4)|((w2&1)<<5)|((w1&1)<<6)|((w0&1)<<7);
		list[4] = lineb;
		list[5] = linew;
		//左辺
		lineb = ((b7&128)<<0)|((b6&128)<<1)|((b5&128)<<2)|((b4&128)<<3)|((b3&128)<<4)|((b2&128)<<5)|((b1&128)<<6)|((b0&128)<<7);
		linew = ((w7&128)<<0)|((w6&128)<<1)|((w5&128)<<2)|((w4&128)<<3)|((w3&128)<<4)|((w2&128)<<5)|((w1&128)<<6)|((w0&128)<<7);
		list[6] = lineb>>>7;
		list[7] = linew>>>7;
		
		
		
		//horizontal 2
		//上辺
		list[8] = b1;
		list[9] = w1;
		//下辺
		list[10] = b6;
		list[11] = w6;
		//右辺
		lineb = ((b7&2)<<0)|((b6&2)<<1)|((b5&2)<<2)|((b4&2)<<3)|((b3&2)<<4)|((b2&2)<<5)|((b1&2)<<6)|((b0&2)<<7);
		linew = ((w7&2)<<0)|((w6&2)<<1)|((w5&2)<<2)|((w4&2)<<3)|((w3&2)<<4)|((w2&2)<<5)|((w1&2)<<6)|((w0&2)<<7);
		list[12] = lineb>>>1;
		list[13] = linew>>>1;
		//左辺
		lineb = ((b7&64)<<0)|((b6&64)<<1)|((b5&64)<<2)|((b4&64)<<3)|((b3&64)<<4)|((b2&64)<<5)|((b1&64)<<6)|((b0&64)<<7);
		linew = ((w7&64)<<0)|((w6&64)<<1)|((w5&64)<<2)|((w4&64)<<3)|((w3&64)<<4)|((w2&64)<<5)|((w1&64)<<6)|((w0&64)<<7);
		list[14] = lineb>>>6;
		list[15] = linew>>>6;
		
	
		
		//horizontal 3
		//上辺
		list[16] = b2;
		list[17] = w2;
		//下辺
		list[18] = b5;
		list[19] = w5;
		//右辺
		lineb = ((b7&4)<<0)|((b6&4)<<1)|((b5&4)<<2)|((b4&4)<<3)|((b3&4)<<4)|((b2&4)<<5)|((b1&4)<<6)|((b0&4)<<7);
		linew = ((w7&4)<<0)|((w6&4)<<1)|((w5&4)<<2)|((w4&4)<<3)|((w3&4)<<4)|((w2&4)<<5)|((w1&4)<<6)|((w0&4)<<7);
		list[20] = lineb>>>2;
		list[21] = linew>>>2;
		//左辺
		lineb = ((b7&32)<<0)|((b6&32)<<1)|((b5&32)<<2)|((b4&32)<<3)|((b3&32)<<4)|((b2&32)<<5)|((b1&32)<<6)|((b0&32)<<7);
		linew = ((w7&32)<<0)|((w6&32)<<1)|((w5&32)<<2)|((w4&32)<<3)|((w3&32)<<4)|((w2&32)<<5)|((w1&32)<<6)|((w0&32)<<7);
		list[22] = lineb>>>5;
		list[23] = linew>>>5;
	
	
		
		//horizontal 4
		//上辺
		list[24] = b3;
		list[25] = w3;
		//下辺
		list[26] = b4;
		list[27] = w4;
		//右辺
		lineb = ((b7&8)<<0)|((b6&8)<<1)|((b5&8)<<2)|((b4&8)<<3)|((b3&8)<<4)|((b2&8)<<5)|((b1&8)<<6)|((b0&8)<<7);
		linew = ((w7&8)<<0)|((w6&8)<<1)|((w5&8)<<2)|((w4&8)<<3)|((w3&8)<<4)|((w2&8)<<5)|((w1&8)<<6)|((w0&8)<<7);
		list[28] = lineb>>>3;
		list[29] = linew>>>3;
		//左辺
		lineb = ((b7&16)<<0)|((b6&16)<<1)|((b5&16)<<2)|((b4&16)<<3)|((b3&16)<<4)|((b2&16)<<5)|((b1&16)<<6)|((b0&16)<<7);
		linew = ((w7&16)<<0)|((w6&16)<<1)|((w5&16)<<2)|((w4&16)<<3)|((w3&16)<<4)|((w2&16)<<5)|((w1&16)<<6)|((w0&16)<<7);
		list[30] = lineb>>>4;
		list[31] = linew>>>4;
		
	
		
		//diagonal 8
		//右肩上がり
		lineb = (b7&128)|(b6&64)|(b5&32)|(b4&16)|(b3&8)|(b2&4)|(b1&2)|(b0&1);
		linew = (w7&128)|(w6&64)|(w5&32)|(w4&16)|(w3&8)|(w2&4)|(w1&2)|(w0&1);
		list[32] = lineb;
		list[33] = linew;
		list[34] = lineb;
		list[35] = linew;
		//右肩下がり
		lineb = (b7&1)|(b6&2)|(b5&4)|(b4&8)|(b3&16)|(b2&32)|(b1&64)|(b0&128);
		linew = (w7&1)|(w6&2)|(w5&4)|(w4&8)|(w3&16)|(w2&32)|(w1&64)|(w0&128);
		list[36] = lineb;
		list[37] = linew;
		list[38] = lineb;
		list[39] = linew;
		
		return list;
		
		//corner 8
		//upper left
		lineb = ((b0&128))|((b1&128)>>>1)|((b0&64)>>>1)|((b2&128)>>>3)|((b1&64)>>>3)|((b0&32)>>>3)|((b3&128)>>>6)|((b0&16)>>>4);
		linew = ((w0&128))|((w1&128)>>>1)|((w0&64)>>>1)|((w2&128)>>>3)|((w1&64)>>>3)|((w0&32)>>>3)|((w3&128)>>>6)|((w0&16)>>>4);
		list[40] = lineb;
		list[41] = linew;
		//upper right
		lineb = ((b0&1)<<7)|((b1&1)<<6)|((b0&2)<<4)|((b2&1)<<4)|((b1&2)<<2)|((b0&4)<<0)|((b3&1)<<1)|((b0&8)>>>3);
		linew = ((w0&1)<<7)|((w1&1)<<6)|((w0&2)<<4)|((w2&1)<<4)|((w1&2)<<2)|((w0&4)<<0)|((w3&1)<<1)|((w0&8)>>>3);
		list[42] = lineb;
		list[43] = linew;
		//lower left
		lineb = ((b7&128))|((b6&128)>>>1)|((b7&64)>>>1)|((b5&128)>>>3)|((b6&64)>>>3)|((b7&32)>>>3)|((b4&128)>>>6)|((b7&16)>>>4);
		linew = ((w7&128))|((w6&128)>>>1)|((w7&64)>>>1)|((w5&128)>>>3)|((w6&64)>>>3)|((w7&32)>>>3)|((w4&128)>>>6)|((w7&16)>>>4);
		list[44] = lineb;
		list[45] = linew;
		//lower right
		lineb = ((b7&1)<<7)|((b6&1)<<6)|((b7&2)<<4)|((b5&1)<<4)|((b6&2)<<2)|((b7&4)<<0)|((b4&1)<<1)|((b7&8)>>>3);
		linew = ((w7&1)<<7)|((w6&1)<<6)|((w7&2)<<4)|((w5&1)<<4)|((w6&2)<<2)|((w7&4)<<0)|((w4&1)<<1)|((w7&8)>>>3);
		list[46] = lineb;
		list[47] = linew;
		
		
		
		//diagonal 7
		//upper left
		lineb = (b6&128)|(b5&64)|(b4&32)|(b3&16)|(b2&8)|(b1&4)|(b0&2);
		linew = (w6&128)|(w5&64)|(w4&32)|(w3&16)|(w2&8)|(w1&4)|(w0&2);
		list[48] = lineb>>>1;
		list[49] = linew>>>1;
		//lower right
		lineb = (b1&1)|(b2&2)|(b3&4)|(b4&8)|(b5&16)|(b6&32)|(b7&64);
		linew = (w1&1)|(w2&2)|(w3&4)|(w4&8)|(w5&16)|(w6&32)|(w7&64);
		list[50] = lineb;
		list[51] = linew;
		//lower left
		lineb = (b1&128)|(b2&64)|(b3&32)|(b4&16)|(b5&8)|(b6&4)|(b7&2);
		linew = (w1&128)|(w2&64)|(w3&32)|(w4&16)|(w5&8)|(w6&4)|(w7&2);
		list[52] = lineb>>>1;
		list[53] = linew>>>1;
		//upper right
		lineb = (b6&1)|(b5&2)|(b4&4)|(b3&8)|(b2&16)|(b1&32)|(b0&64);
		linew = (w6&1)|(w5&2)|(w4&4)|(w3&8)|(w2&16)|(w1&32)|(w0&64);
		list[54] = lineb;
		list[55] = linew;
	
		
		
		//diagonal 6
		//upper left
		lineb = (b5&128)|(b4&64)|(b3&32)|(b2&16)|(b1&8)|(b0&4);
		linew = (w5&128)|(w4&64)|(w3&32)|(w2&16)|(w1&8)|(w0&4);
		list[56] = lineb>>>2;
		list[57] = linew>>>2;
		//lower right
		lineb = (b2&1)|(b3&2)|(b4&4)|(b5&8)|(b6&16)|(b7&32);
		linew = (w2&1)|(w3&2)|(w4&4)|(w5&8)|(w6&16)|(w7&32);
		list[58] = lineb;
		list[59] = linew;
		//lower left
		lineb = (b2&128)|(b3&64)|(b4&32)|(b5&16)|(b6&8)|(b7&4);
		linew = (w2&128)|(w3&64)|(w4&32)|(w5&16)|(w6&8)|(w7&4);
		list[60] = lineb>>>2;
		list[61] = linew>>>2;
		//upper right
		lineb = (b5&1)|(b4&2)|(b3&4)|(b2&8)|(b1&16)|(b0&32);
		linew = (w5&1)|(w4&2)|(w3&4)|(w2&8)|(w1&16)|(w0&32);
		list[62] = lineb;
		list[63] = linew;
	
		
		
		//corner24
		//horizontal upper left
		lineb = (b0&0xf0)|((b1&0xf0)>>>4);
		linew = (w0&0xf0)|((w1&0xf0)>>>4);
		list[64] = lineb;
		list[65] = linew;
		//horizontal lower left
		lineb = (b7&0xf0)|((b6&0xf0)>>>4);
		linew = (w7&0xf0)|((w6&0xf0)>>>4);
		list[66] = lineb;
		list[67] = linew;
		//horizontal upper right
		lineb = ((b0&1)<<7)|((b0&2)<<5)|((b0&4)<<3)|((b0&8)<<1)|((b1&1)<<3)|((b1&2)<<1)|((b1&4)>>>1)|((b1&8)>>>3);
		linew = ((w0&1)<<7)|((w0&2)<<5)|((w0&4)<<3)|((w0&8)<<1)|((w1&1)<<3)|((w1&2)<<1)|((w1&4)>>>1)|((w1&8)>>>3);
		list[68] = lineb;
		list[69] = linew;
		//horizontal lower right
		lineb = ((b7&1)<<7)|((b7&2)<<5)|((b7&4)<<3)|((b7&8)<<1)|((b6&1)<<3)|((b6&2)<<1)|((b6&4)>>>1)|((b6&8)>>>3);
		linew = ((w7&1)<<7)|((w7&2)<<5)|((w7&4)<<3)|((w7&8)<<1)|((w6&1)<<3)|((w6&2)<<1)|((w6&4)>>>1)|((w6&8)>>>3);
		list[70] = lineb;
		list[71] = linew;


		//vertical upper left
		lineb = ((b0&128)>>>0)|((b1&128)>>>1)|((b2&128)>>>2)|((b3&128)>>>3)|((b0&64)>>>3)|((b1&64)>>>4)|((b2&64)>>>5)|((b3&64)>>>6);
		linew = ((w0&128)>>>0)|((w1&128)>>>1)|((w2&128)>>>2)|((w3&128)>>>3)|((w0&64)>>>3)|((w1&64)>>>4)|((w2&64)>>>5)|((w3&64)>>>6);
		list[72] = lineb;
		list[73] = linew;
		//vertical lower left
		lineb = ((b7&128)>>>0)|((b6&128)>>>1)|((b5&128)>>>2)|((b4&128)>>>3)|((b7&64)>>>3)|((b6&64)>>>4)|((b5&64)>>>5)|((b4&64)>>>6);
		linew = ((w7&128)>>>0)|((w6&128)>>>1)|((w5&128)>>>2)|((w4&128)>>>3)|((w7&64)>>>3)|((w6&64)>>>4)|((w5&64)>>>5)|((w4&64)>>>6);
		list[74] = lineb;
		list[75] = linew;
		//vertical upper right
		lineb = ((b0&1)<<7)|((b1&1)<<6)|((b2&1)<<5)|((b3&1)<<4)|((b0&2)<<2)|((b1&2)<<1)|((b2&2)<<0)|((b3&2)>>>1);
		linew = ((w0&1)<<7)|((w1&1)<<6)|((w2&1)<<5)|((w3&1)<<4)|((w0&2)<<2)|((w1&2)<<1)|((w2&2)<<0)|((w3&2)>>>1);
		list[76] = lineb;
		list[77] = linew;
		//vertical lower right
		lineb = ((b7&1)<<7)|((b6&1)<<6)|((b5&1)<<5)|((b4&1)<<4)|((b7&2)<<2)|((b6&2)<<1)|((b5&2)<<0)|((b4&2)>>>1);
		linew = ((w7&1)<<7)|((w6&1)<<6)|((w5&1)<<5)|((w4&1)<<4)|((w7&2)<<2)|((w6&2)<<1)|((w5&2)<<0)|((w4&2)>>>1);
		list[78] = lineb;
		list[79] = linew;
		
		return list;
	}

	flip(){
		const reverse = (x)=>{
			x = ((x&0b10101010)>>>1) | ((x&0b01010101)<<1);
			x = ((x&0b11001100)>>>2) | ((x&0b00110011)<<2);
			x = ((x&0b11110000)>>>4) | ((x&0b00001111)<<4);
			return x;
		};

		const lines = this.shape().map(reverse);
		const newNode = new BOARD(this);
		
		newNode.black1 = (lines[0]<<24)|(lines[8]<<16)|(lines[16]<<8)|lines[24];
		newNode.black2 = (lines[26]<<24)|(lines[18]<<16)|(lines[10]<<8)|lines[2];
		newNode.white1 = (lines[1]<<24)|(lines[9]<<16)|(lines[17]<<8)|lines[25];
		newNode.white2 = (lines[27]<<24)|(lines[19]<<16)|(lines[11]<<8)|lines[3];

		return newNode;
	}

	rotate(){
		const reverse = (x)=>{
			x = ((x&0b10101010)>>>1) | ((x&0b01010101)<<1);
			x = ((x&0b11001100)>>>2) | ((x&0b00110011)<<2);
			x = ((x&0b11110000)>>>4) | ((x&0b00001111)<<4);
			return x;
		};

		const lines = this.shape().map(reverse);
		const newNode = new BOARD(this);
		
		newNode.black1 = (lines[6]<<24)|(lines[14]<<16)|(lines[22]<<8)|lines[30];
		newNode.black2 = (lines[28]<<24)|(lines[20]<<16)|(lines[12]<<8)|lines[4];
		newNode.white1 = (lines[7]<<24)|(lines[15]<<16)|(lines[23]<<8)|lines[31];
		newNode.white2 = (lines[29]<<24)|(lines[21]<<16)|(lines[13]<<8)|lines[5];

		return newNode;
	}

	negaAlpha(alpha=-100, beta=100, depth=1){
		let num_readnode = 0;
		const search = (node, alpha, beta, depth)=>{
			num_readnode++;
			if(depth===0){
				return node.black_white()*node.turn;
			}
			switch(node.state()){
				case 1:
					const children = node.expand();
					for(const child of children){
						alpha = Math.max(alpha, -search(child, -beta, -alpha, depth-1));
						if(alpha>=beta){
							return alpha;
						}
					}
					return alpha;
				case 2:
					const child = new BOARD(node);
					child.turn *= -1;
					return -search(child, -beta, -alpha, depth-1);
				case 3:
					return node.black_white()*node.turn;
			}
		}
		const score = search(this, alpha, beta, depth);
		console.log(`read ${num_readnode} nodes`);
		return score;
	}
}


// テストボード
const ffo0 = new BOARD();
Object.assign(ffo0, {black1: -66011956, black2: -726335776, white1: 14696499, white2: 709361678, turn: 1, stones: 50})
