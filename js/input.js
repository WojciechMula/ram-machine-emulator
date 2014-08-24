/*
	**** Emulator maszyny RAM ****

	::Obs³uga taœmy wejœciowej::

	Wojciech Mu³a, kwiecieñ 2003
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */


//**** funkcje globalne ****************************************************
/*

 function intape_init()
 -- inicjuje taœmê wejœciow¹

 function intape_enable(enable)
 -- w³¹cza/wy³¹cza interfejs u¿ytkownika do obs³ugi taœmy

 function intape_clear()
 -- czyœci zawartoœæ taœmy

 function intape_put(value)
 -- dopisuje na koniec taœmy wartoœæ 'value'

 function intape_get()
 -- odcztuje wartoœæ z taœmy, przesuwa wskaŸnik

 function intape_add_userval()
 -- dodaje elementy wpisane przez u¿ytkownika; wszelkie b³êdnie zapisane
    liczby s¹ ignorowane; separatorami s¹ spacje i przecinki

 function intape_add_randval()
 -- dodaje przypadkowy element do taœmy; zakres losowanych liczb okreœla
    u¿ytkownik

 function intape_dump2con()
 -- wypisuje zawartoœæ *ca³ej* taœmy na konsolê
*/

function intape_init()
{
 intape_clear();
 document._input.lo.value = "0";   // domyœlny zakres losowania
 document._input.hi.value = "100";
}

function intape_enable(enable)
{
 document._input.add_user.disabled = !enable;
 document._input.add_rand.disabled = !enable;
 document._input.lo.disabled       = !enable;
 document._input.hi.disabled       = !enable;
 document._input.clear.disabled    = !enable;
 document._input.dump.disabled     = !enable;
 document._input.display.disabled  = !enable;
}

function intape_clear()
{
 __it_tape = [];
 __it_nextread = 0;
 __it_update_view();
}

function intape_put(value)
{
 __it_tape = __it_tape.concat([ value ]);
 __it_update_view();
}

function intape_get()
{
 if (__it_nextread == __it_tape.length)
 	{
 	 warning("Odczyt z pustej taœmy wejœciowej. Dopisano now¹, przypadkow¹ wartoœæ i ponowiono próbê.");
 	 intape_add_randval();
 	}

 var x = __it_tape[__it_nextread++];

 __it_update_view();
 return x;
}

function intape_dump2con()
{
 var s = __it_tape.toString();
 information("Zawartoœæ taœmy wejœciowej (iloœæ elementów: " + __it_tape.length + ")\n" + s);
}

function intape_add_userval()
{
 var tmp = prompt("WprowadŸ liczby ca³kowite z zakresu " + __it_min_val + "..." + __it_max_val + " oddzielone spacjami lub przecinkiami:", "0");

 if (tmp == null)
 	return; // naciœniêto Cancel

 tmp = split_fields(tmp, ", ");

 for (i in tmp)
 	{
 	 if (!isinteger(tmp[i]))
 	 	continue; // nie-liczba

 	 var number = parseInt(tmp[i]);
 	 if ((number < __it_min_val) || (number > __it_max_val))
 	 	continue; // przekroczony zakres

 	 intape_put(number);
 	}
}

function intape_add_randval()
{

 	// np. "  12456     " -> "12456"
 	function clip_spaces(string)
 	{
 	 if (string.length == 0) return string;

 	 var s = 0;
 	 var e = string.length-1;

 	 while ((string.charAt(s) == " ") && (s < string.length)) s++;
 	 while ((string.charAt(e) == " ") && (e > s)) e--;

 	 return string.substring(s, e+1);
 	}

 var range = 100;
 var lo = clip_spaces(document._input.lo.value);
 var hi = clip_spaces(document._input.hi.value);

 if (!isinteger(lo))
 	lo = 0;
 else
 	{
 	 lo = parseInt(lo);
 	 if ((lo == NaN) || (lo < __it_min_val) || (lo > __it_max_val))
 	 	lo = 0;
 	}

 if (!isinteger(hi))
 	hi = range;
 else
 	{
 	 hi = parseInt(hi);
 	 if ((hi == NaN) || (hi < __it_min_val) || (hi > __it_max_val))
 	 	hi = range;
 	}

 if (lo > hi)
 	{
 	 var tmp = lo;
 	      lo = hi;
 	      hi = tmp;
 	}

 intape_put( Math.floor(Math.random()*(hi-lo+1)) + lo );

 document._input.lo.value = lo;
 document._input.hi.value = hi;
}

//**** funkcje lokalne *****************************************************
/*

 function __it_update_view()
 -- uaktulania "widok" taœmy
    wyœwietlane s¹ pozycje pocz¹wszy od pierwszej do odczytania

*/

function __it_update_view()
{
 var s = __it_tape.slice(__it_nextread).toString();
 // wyœwietl tylko n pierwszych znaków (n - szerokoœæ pola tekstowego),
 document._input.display.value = s.substring(0, document._input.display.size);
}

//**** zmienne lokalne *****************************************************
var __it_min_val = -1e7;  // zakres dopuszczalnych liczb
var __it_max_val =  1e7;

var __it_tape     = []; // lista liczb
var __it_nextread = 0;  // indeks (w '__it_tape') nastêpnej liczby do
                        // odczytania

//**** eof *****************************************************************

