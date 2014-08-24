/*
	**** Emulator maszyny RAM ****

	::Obs³uga taœmy wyjœciowej::

	Wojciech Mu³a, kwiecieñ 2003
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */


//**** funkcje globalne ****************************************************
/*

 function outtape_init()
 -- inicjuje taœmê wyjœciow¹

 function outtape_enable(enable)
 -- w³¹cza/wy³¹cza interfejs u¿ytkownika do obs³ugi taœmy

 function outtape_clear()
 -- czyœci taœmê

 function outtape_put(value)
 -- dopisuje na koniec taœmy wartoœæ

 function outtape_dump2con()
 -- wypisuje zawartoœæ *ca³ej* taœmy na konsolê

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
 information("Zawartoœæ taœmy wyjœciowej (iloœæ elementów: " + __ot_tape.length + ")\n" + s);
}

//**** funkcje loklane *****************************************************

function __ot_update_view()
{
 var s = __ot_tape.toString();
 // wyœwietl tylko ostatnich n znaków (n - szerokoœæ pola tekstowego),
 document._output.display.value = s.substring(s.length-document._output.display.size);
}

//*** zmienne lokalne ******************************************************

var __ot_tape = []; // taœma

//*** eof ******************************************************************
