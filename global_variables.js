/*
	**** Emulator maszyny RAM ****

	::zmienne globalne::

	Wojciech Mu�a, kwiecie� 2003
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */

//**** zmienne globalne ****************************************************
var register_count = 1024;                        // ilo�� rejestr�w
var registers      = new Array(register_count+1); // fizyczne rejestry

var source_code;   // tre�� aktulanie wykonywanego programu, podzielona
                   // na linjki (tablica)
var bytecode;      // bajtkod aktualnie wykonywanego programu

//**** eof *****************************************************************



