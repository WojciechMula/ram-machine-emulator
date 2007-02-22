/*
	**** Emulator maszyny RAM ****

	::zmienne globalne::

	Wojciech Mu³a, kwiecieñ 2003, luty 2007
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */

//**** zmienne globalne ****************************************************
var registers;

// + 22.02.2007 -- klasa realizuj±ca dostêp do rejestrów
function Registers() {
	
	function get(num) {
		var reg = "r" + num
		if (typeof(this[reg]) == 'undefined')
			this[reg] = 0x00;
		return this[reg];
	}

	function set(num, value) {
		this["r" + num] = value;
	}

	function slice(a, b) {
		if (b-a <= 0 || a >= b) return [];

		var i;
		var result = new Array();
		for (i=a; i < b; i++) {
			result.push( this.get(i) );
		}

		alert(result);
		return result;
	}

	this.get = get;
	this.set = set;
	this.slice = slice;
}

var source_code;   // treœæ aktulanie wykonywanego programu, podzielona
                   // na linjki (tablica)
var bytecode;      // bajtkod aktualnie wykonywanego programu

//**** eof *****************************************************************



