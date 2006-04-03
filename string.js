/*
	**** Emulator maszyny RAM ****

	::funkcje pomocnicze::

	Wojciech Mu�a, kwiecie� 2003
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */


//**** funkcje globalne ****************************************************
/*

 function match(string, set)
 function isnumber(string)
 function isinteger(string)
 function isidentifier(string)
 function split_fields(string, separators)
 function split_lines(text)


*/

/*
 * funkcja  : match
 * argumenty: string - �a�cuch znak�w
 *               set - �a�cuch znak�w
 * wyniki   : 1 lub 0
 * opis     : zwraca 1, gdy wszystkie znaki z �a�cucha 'string'
 *            nale�� do zbioru 'set'
 *            regexp: [set]+
 */
function match(string, set)
{
 var i;
 if (string.length == 0)
 	return 0;
 for (i=0; i<string.length; i++)
 	if (set.indexOf( string.charAt(i) ) == -1 )
 		return 0;

 return 1;
}

/*
 * funkcja  : isnumber
 * argumenty: string - �a�cuch znak�w
 * wyniki   : 0 lub 1
 * opis     : zwraca 1 gdy �a�cuch 'string' pasuje do regexpa: [0-9]+
 *            (liczba ca�kowita dodadnia, bez znaku)
 */
function isnumber(string)
{
 return match(string, __str_digits);
}

/*
 * funkcja  : isinteger
 * argumenty: string - �a�cuch znak�w
 * wyniki   : 0 lub 1
 * opis     : zwraca 1 gdy �a�cuch 'string' pasuje do regexpa: [+-][0-9]+
 *            (liczba ca�kowita ze znakiem)
 */
function isinteger(string)
{
 if ((string.charAt(0) == '+') || (string.charAt(0) == '-'))
    return match( string.substring(1, string.length), __str_digits);
 else
    return match( string, __str_digits);
}

/*
 * funkcja  : isidentifier
 * argumenty: string - �a�cuch znak�w
 * wyniki   : 0 lub 1
 * opis     : zwraca 1 gdy �a�cuch 'string' pasuje do regexpa: [a-zA-Z_][a-zA-Z0-9_]+
 *            (identyfikator: sk�ada si� z liter, cyfr i znaku podkre�lenie;
 *             nie mo�e zaczyna� si� od cyfry)
 */
function isidentifier(string)
{
 if (string.length == 0)
 	return 0;

 // [a-z_]
 if (match(string.charAt(0), __str_letters + "_") == 0)
 	return 0;
 if (string.length == 1)
 	return 1;

 // [a-z0-9_]+ (dla �a�cuch�w d�u�szych od 1 znaku)
 return match(string.substring(1, string.length), __str_letters + __str_digits + "_");
}


/*
 * funkcja  : split_fields
 * argumenty: string     - �a�cuch znak�w
 *            separators - �a�cuch znak�w (bia�e znaki)
 * wyniki   : tablica �a�cuch�w
 * opis     : dzieli �a�cuch 'string' na pola rozdzielone znakami
 *            ze zbioru 'separators'
 *            np. split_fields(" a, b xxx. ddd", " ,") == ["a", "b", "xxx", "ddd"]
 */
function split_fields(string, separators)
{
 var a = [];
 var i, tmp;
 var prev, curr

 tmp  = "";
 prev = 1;
 for (i=0; i<string.length; i++)
 	{
 	 curr = separators.indexOf( string.charAt(i) ) >= 0; // separator pola

 	 if ((curr != prev) && (curr == 1)) // konic ci�gu nie-bia�ych znak�w
 	 	{
 	 	 a   = a.concat([tmp]);     // dodaj wi�c do listy nowe pole
 	 	 tmp = "";
 	 	}

 	 if (curr == 0)
 	 	tmp = tmp + string.charAt(i);

 	 prev = curr;
 	}

 if (tmp != "")
 	a = a.concat([tmp]);
 return a;
}

/*
 * funkcja  : split_lines
 * argumenty: string - �a�cuch znak�w
 * wyniki   : tablica �a�cuch�w
 * opis     : zwraca list� �a�cuch�w, rozdzielonych znakami ko�ca linii (\n)
 *            np. split_lines("aaaa\nxxxx\n\nbbbb") = ["aaaa", "xxxx", "", "bbbb"]
 */
function split_lines(text)
{
 var idx, first = 0;
 var l = []

 while (1)
 	{
 	 idx = text.indexOf("\n", first);
 	 if (idx > 0)
 	 	{
 	 	 l     = l.concat([text.substring(first, idx)]);
 	 	 first = idx+1;
 	 	}
 	 else
 	 	{
 	 	 l = l.concat([text.substring(first, text.length)]);
 	 	 break;
 	 	}
 	}

 return l;
}

//**** zmienne lokalne *****************************************************

var __str_digits  = "0123456789";
    __str_letters = "abcdefghijklmnopqrstuvwxyz";

//**** eof *****************************************************************
