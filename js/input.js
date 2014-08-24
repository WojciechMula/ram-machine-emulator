/*
	**** Emulator maszyny RAM ****

	::Obs�uga ta�my wej�ciowej::

	Wojciech Mu�a, kwiecie� 2003
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */


//**** funkcje globalne ****************************************************
/*

 function intape_init()
 -- inicjuje ta�m� wej�ciow�

 function intape_enable(enable)
 -- w��cza/wy��cza interfejs u�ytkownika do obs�ugi ta�my

 function intape_clear()
 -- czy�ci zawarto�� ta�my

 function intape_put(value)
 -- dopisuje na koniec ta�my warto�� 'value'

 function intape_get()
 -- odcztuje warto�� z ta�my, przesuwa wska�nik

 function intape_add_userval()
 -- dodaje elementy wpisane przez u�ytkownika; wszelkie b��dnie zapisane
    liczby s� ignorowane; separatorami s� spacje i przecinki

 function intape_add_randval()
 -- dodaje przypadkowy element do ta�my; zakres losowanych liczb okre�la
    u�ytkownik

 function intape_dump2con()
 -- wypisuje zawarto�� *ca�ej* ta�my na konsol�
*/

function intape_init()
{
 intape_clear();
 document._input.lo.value = "0";   // domy�lny zakres losowania
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
 	 warning("Odczyt z pustej ta�my wej�ciowej. Dopisano now�, przypadkow� warto�� i ponowiono pr�b�.");
 	 intape_add_randval();
 	}

 var x = __it_tape[__it_nextread++];

 __it_update_view();
 return x;
}

function intape_dump2con()
{
 var s = __it_tape.toString();
 information("Zawarto�� ta�my wej�ciowej (ilo�� element�w: " + __it_tape.length + ")\n" + s);
}

function intape_add_userval()
{
 var tmp = prompt("Wprowad� liczby ca�kowite z zakresu " + __it_min_val + "..." + __it_max_val + " oddzielone spacjami lub przecinkiami:", "0");

 if (tmp == null)
 	return; // naci�ni�to Cancel

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
 -- uaktulania "widok" ta�my
    wy�wietlane s� pozycje pocz�wszy od pierwszej do odczytania

*/

function __it_update_view()
{
 var s = __it_tape.slice(__it_nextread).toString();
 // wy�wietl tylko n pierwszych znak�w (n - szeroko�� pola tekstowego),
 document._input.display.value = s.substring(0, document._input.display.size);
}

//**** zmienne lokalne *****************************************************
var __it_min_val = -1e7;  // zakres dopuszczalnych liczb
var __it_max_val =  1e7;

var __it_tape     = []; // lista liczb
var __it_nextread = 0;  // indeks (w '__it_tape') nast�pnej liczby do
                        // odczytania

//**** eof *****************************************************************

