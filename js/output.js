/*
	**** Emulator maszyny RAM ****

	::Obs�uga ta�my wyj�ciowej::

	Wojciech Mu�a, kwiecie� 2003
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */


//**** funkcje globalne ****************************************************
/*

 function outtape_init()
 -- inicjuje ta�m� wyj�ciow�

 function outtape_enable(enable)
 -- w��cza/wy��cza interfejs u�ytkownika do obs�ugi ta�my

 function outtape_clear()
 -- czy�ci ta�m�

 function outtape_put(value)
 -- dopisuje na koniec ta�my warto��

 function outtape_dump2con()
 -- wypisuje zawarto�� *ca�ej* ta�my na konsol�

*/


function outtape_init()
{
 outtape_clear();
}

function outtape_enable(enable)
{
 document._output.clear.disabled   = !enable;
 document._output.dump.disabled    = !enable;
 document._output.display.disabled = !enable;
}

function outtape_clear()
{
 __ot_tape = [];
 __ot_update_view();
}

function outtape_put(value)
{
 __ot_tape = __ot_tape.concat([ value ]);
 __ot_update_view();
}

function outtape_dump2con()
{
 var s = __ot_tape.toString();
 information("Zawarto�� ta�my wyj�ciowej (ilo�� element�w: " + __ot_tape.length + ")\n" + s);
}

//**** funkcje loklane *****************************************************

function __ot_update_view()
{
 var s = __ot_tape.toString();
 // wy�wietl tylko ostatnich n znak�w (n - szeroko�� pola tekstowego),
 document._output.display.value = s.substring(s.length-document._output.display.size);
}

//*** zmienne lokalne ******************************************************

var __ot_tape = []; // ta�ma

//*** eof ******************************************************************
