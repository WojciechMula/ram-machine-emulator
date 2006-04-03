/*
	**** Emulator maszyny RAM ****

	::Podgl¹d rejestrów::

	Wojciech Mu³a, kwiecieñ 2003
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */


//**** funkcje globalne ****************************************************
/*

 function watch_init()
 -- inicjacja

 function watch_enable(enable)
 -- w³¹cza/wy³¹cza interfejs u¿ytkownika

 function watch_userprompt()
 -- wyœwietla okienko do którego u¿ytkownik mo¿e wpisaæ które rejestry maj¹
    byæ "obserwowane"

	Sk³adnia wyra¿eñ jest nastêpuj¹ca:
		[nazwa=]numer rejestru[:numer rejestru]

	'nazwa' jest identyfikatorem (regexp [a-z_][a-z0-9_]+).

	Przyk³ady (r0=66, r1=10, r2=-9, r3=12, r4=6, r5=7, r6=99):

	zapis      	wyœwietlane

	5          	r5 = 7
	1:3        	[10,-9,12]
	licznik=6  	licznik = 99
	           	licznik(6) = 99
	tablica=2:5	tablica = [-9,12,6,7]
	           	tablica(2:5) = [-9,12,6,7]

	Wszelkie b³êdnie zapisane wyra¿enia s¹ ignorowane. Powtarzaj¹ce siê
	rejestry (ale pojedyncze, nie w tablicach) s¹ równie¿ ignorowane,
	wykorzystywana jest tylko pierwsza definicja; np.

	a=5 b=5    		a=5

	Zawsze na pocz¹tku wyœwietlany jest akumulator - rejestr 0,
	w postaci r0 = xxx.
*/

function watch_init()
{
 __watch_list       = [[0, ""]];
 __watch_expression = "";
 document._watch.display.value = "";
}

function watch_enable(enable)
{
 document._watch.setwatch.disabled    = !enable;
 document._watch.show_regnum.disabled = !enable;
 document._watch.display.disabled     = !enable;
}

function watch_userprompt()
{
 var tmp = prompt("Przyk³ady: 3 licznik=5 tablica=7:12 9:23", __watch_expression);

 if (tmp == null)
 	return; // wciœniêto Cancel;
 else
 	__watch_expression = tmp;

 var fields = split_fields(__watch_expression, " ");

 __watch_list = [[0, ""]];
 for (i in fields)
 	{
 	 var name = "";
 	 var idx;
 	 var string = fields[i];

 	 idx = string.indexOf("=");
 	 if (idx > -1) // nazwa=numer rej.|zakres tablicy
 	 	{
 	 	 name = string.substring(0, idx);
 	 	 if (!isidentifier(name.toLowerCase()))
 	 	 	continue; // to nie identyfikator

 	 	 string = string.substring(idx+1, string.length);
 	 	}

 	 idx = string.indexOf(":"); // zakres tablicy
 	 if (idx > -1)
 	 	{
 	 	 var lo = string.substring(0, idx);
 	 	 var hi = string.substring(idx+1, string.length);

 	 	 if (!isnumber(lo) || !isnumber(hi))
 	 	 	continue; // nie-liczby

 	 	 lo = parseInt(lo);
 	 	 hi = parseInt(hi);

 	 	 if ((lo < 0) || (lo > register_count))
 	 	 	continue; // przekroczenie zakresu
 	 	 if ((hi < 0) || (hi > register_count))
 	 	 	continue; // przekroczenie zakresu
 	 	 if (lo > hi)
 	 	 	continue; // z³a relacja algebraiczna

 	 	 __watch_list = __watch_list.concat([ [[lo, hi], name]]);
 	 	}
 	 else // pojedynczy numer
 	 	{
 	 	 var number = string;
 	 	 if (!isnumber(number))
 	 	 	continue; // nie-liczba

 	 	 number = parseInt(number);
 	 	 if ((number < 0) || (number > register_count))
 	 	 	continue; // przekroczenie zakresu

 	 	 __watch_list = __watch_list.concat([ [number, name] ]);
 	 	}
 	}

 watch_update_view();
}

function watch_update_view()
{ document._watch.display.value = watchlist2string(); }

function watch_dump2con()
{ information(watchlist2string()); }

//**** funkcje lokalne *****************************************************

function watchlist2string()
{
 var string = "";

 for (i in __watch_list)
 	{
 	 if (typeof(__watch_list[i][0]) == "number") // pojedyncza liczba
 	 	{
 	 	 if (__watch_list[i][1].length > 0)
 	 	 	{
 	 	 	 string = string + " "  + __watch_list[i][1];
 	 	 	 if (document._watch.show_regnum.checked)
 	 	 	 	string = string + "(" + __watch_list[i][0] + ")";
 	 	 	}
 	 	 else
 	 	 	 string = string + " r" + __watch_list[i][0];

 	 	 string = string + "=" + registers[__watch_list[i][0]];
 	 	}
 	 else // tablica
 	 	{
 	 	 var lo = __watch_list[i][0][0];
 	 	 var hi = __watch_list[i][0][1];

 	 	 if (__watch_list[i][1].length > 0)
 	 	 	{
 	 	 	 string = string + " " + __watch_list[i][1];
 	 	 	 if (document._watch.show_regnum.checked)
 	 	 	 	string = string + "[" + lo +  ":" + hi + "]";
 	 	 	}
 	 	 else
 	 	 	string = string + " a[" + lo + ":" + hi + "]"

 	 	 string = string + "=[" + registers.slice(lo, hi+1) + "]";

 	 	}
 	}
 return string;
}

//**** zmienne lokalne *****************************************************

var __watch_list = []; // obserwowane wyra¿enia; zapisywane s¹ tuple:
                     // 	[numer, nazwa], lub
                     // 	[[dolny, górny indeks], nazwa tablicy]
    __watch_expression = "";

//**** eof *****************************************************************
