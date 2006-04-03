/*
	**** Emulator maszyny RAM ****

	::Kompilator (parser+translator)::

	Wojciech Mu�a, kwiecie� 2003
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */


//**** zmienne globalne ****************************************************
var addressing_immediate = 0x00; // sta�a natychmiastowa;      np. load =5
    addressing_direct    = 0x01; // adresowanie bezpo�rednie;  np. write 7
    addressing_indirect  = 0x02; // adresowanie po�rednie;     np. read *9
    addressing_jump      = 0x03; // skok;                      np. jzero label
    addressing_void      = 0x04; // brak argumentu;            np. halt

//**** funkcje globalne ****************************************************
/*

 function compiler_init()
 -- inicjuje zmienne lokalne

 function compiler_enable(enable)
 -- w��cza/wy��cza interfejs kompilatora/edytora

 function compile_program()
 -- kompiluje program
    gdy kompilacja powiedzie sie do zmiennej globalnej 'souce_code' wpisuje
    linie kodu, zas do 'bytecode' bajtkod (obie wykorzystywane przez emulator)
    przechodzi do trybu emulacji.

*/


function compiler_init() {}

function compiler_enable(enable)
{
 document._compiler.code.disabled      = !enable;
 document._compiler.compile.disabled   = !enable;
 document._compiler.clear_con.disabled = !enable;
 document._compiler.clear.disabled     = !enable;
}

function compile_program()
{
 if (document._compiler.clear_con.checked == true)
 	clear_console();

 lines = split_lines(document._compiler.code.value);

 try {
 	// utw�rz kod po�redni
 	// semicode zawiera czw�rki [numer wiersza kodu, etykieta, opkod, argument]
 	// w przypadku rozkazu skoku argument zawiera (tymczasowo) docelow� etykiet�
 	var semicode = [];
 	var sc;

 	// lista etykiet zawiera tr�jki [indeks w semicode, etykieta, ilo�� odwo�a�]
 	var labels   = [];

 	// zwraca indeks etykiet o nazwie 'name', lub -1 gdy takiej
 	// etykiety nie ma
 	function find_label(name)
 	{
 	 for (j in labels)
 	 	if (labels[j][1] == name) return j;
 	 return -1;
 	}

 	var i;
 	for (i=0; i<lines.length; i++)
 		{
 		 var fields, line;

 		 // usni�cie komentarzy
 		 var comment_start = lines[i].indexOf("#");
 		 if (comment_start >= 0)
 		 	line = lines[i].substring(0, comment_start)
 		 else
 		 	line = lines[i];

 		 // podzia� na pola
 		 fields = split_fields(line.toLowerCase(), " \t\x0d");

 		 // gdy s� jakie� pola, pr�ba ich interpretacji
 		 if (fields.length > 0)
 		 	{
 		 	 sc = generate_bytecode(i, fields);
 		 	 if (sc == -1)
 		 	 	continue;

 		 	 if (sc[1].length > 0) // jest etykieta;
 		 	 	{
 		 	 	 var idx = find_label(sc[1]); // czy ju� zdefiniowana?
 		 	 	 if (idx >= 0)
 		 	 	 	 error("B��d w linii " + i + ": etykieta '" + sc[1] + "' jest ju� zdefiniowna w linii '" + semicode[ labels[idx][0] ][0] + "'.");

 		 	 	 labels = labels.concat( [[semicode.length, sc[1], 0]] );
 		 	 	}

 		 	 semicode = semicode.concat([sc]);
 		 	}
 		}

 	if (semicode.length == 0)
 		{
 		 information("Nie mo�na skompilowa� pustego programu.");
 		 return;
 		}

 	// generacja bajtkodu; konwersja etykiet na adresy (indeksy)
 	// w tablicy 'bytecode'

 	// pojedynczy bajtkod to tr�jka [numer wiersza kodu, opkod, argument]
 	bytecode = [];
 	for (i in semicode)
 		{
 		 // i-ty rozkaz jest rozkazem skoku
 		 if ((semicode[i][2] & 0x0f) == addressing_jump)
 		 	{
 		 	 var idx = find_label(semicode[i][3]);
 		 	 if  (idx < 0)
 		 	 	error("B��d w linii " + semicode[i][0] + ": etykieta '" + semicode[i][3] + "' nie istnieje.");

 		 	 labels[idx][2]++; // zwi�ksz liczb� odwo�a�
 		 	 bytecode = bytecode.concat([ [semicode[i][0], semicode[i][2], labels[idx][0]] ]);
 		 	}
 		 else
 		 	bytecode = bytecode.concat([ [semicode[i][0], semicode[i][2], semicode[i][3]] ]);
 		}

 	for (i in labels)
 		 if (labels[i][2] == 0)
 		 	warning("Ostrze�enie (linia " + semicode[ labels[i][0] ][0] + "): do etykiety '" + labels[i][1] + "' nie ma odwo�a� w programie.");

 	}
 catch (err)
 	{
 	 information("Kompilacja zatrzymana z powodu b��du.");
 	 return;
 	}

 source_code = lines;

 emulator_reset_machine();
 emulation_mode();
 information("Kompilacja powiod�a si�, emulator zosta� uruchomiony.");
 return;
}

//**** funkcje lokalne *****************************************************
/*

 function generate_bytecode(linenumber, fields)
 -- Interpretuje 'fields' (tablic� �a�cuch�w) jako rozkaz ('linenumber'
    u�ywane jest przez komunikaty)

    Je�li 'fields' reprezentuje rozkaz generuje bajkod zgodnie z tabelk�:


	        0       1     2      3      4
	     -------+++++++-------+++++++-------
	 load  0x00   0x01   0x02    x      x
	store   x     0x11   0x12    x      x
	  add  0x20   0x21   0x22    x      x
	  sub  0x30   0x31   0x32    x      x
	 mult  0x40   0x41   0x42    x      x
	  div  0x50   0x51   0x52    x      x
	 read   x     0x61   0x62    x      x
	write  0x70   0x71   0x72    x      x
	 jump   x      x      x     0x83    x
	jzero   x      x      x     0x93    x
	 jgtz   x      x      x     0xa3    x
	 halt   x      x      x      x     0xb4
	  nop   x      x      x      x     0xc4


    Zwraca czw�rk� [linenumber, etykieta, opkod, operand];
    operandem jest liczba, lub nazwa etykiety w przypadku rozkaz�w
    skoku.
*/
function generate_bytecode(linenumber, fields)
{
 	// funkcje lokalne

 	// string ~ /[a-z_][a-z0-9_]+:/
 	function islabel(string)
 	{
 	 var length = string.length;

 	 if (string.charAt(length-1) == ":")
 	 	{
 	 	 // to *musi* by� identyfikator, skoro �a�cuch ko�czy si� ":"
 	 	 if (isidentifier( string.substring(0, string.length-1) ))
 	 	 	return  1; // ok
 	 	 else
 	 	 	return -1; // b��d!
 	 	}
 	 else
 	 	return 0;
 	}

 	// string ~ /\=[+-][0-9]+/
 	function is_immediate(string)
 	{
 	 var repr;
 	 if (string.charAt(0) == "=")
 	 	{
 	 	 repr = string.substring(1, string.length);
 	 	 if (!isinteger(repr))
 	 	 	error("B��d w linii " + linenumber +  ": po znaku '=' spodziewano si� liczby ca�kowitej, jest '" + repr + "'.");

 	 	 argument = parseInt(repr);
 	 	 return addressing_immediate;
 	 	}
 	 else
 	 	return -1;
 	}

 	// string ~ /[0-9]+/
 	function is_direct(string)
 	{
 	 if (!isnumber(string))
 	 	error("B��d w linii " + linenumber +  ": spodziewano si� liczby ca�kowitej, dodatniej; jest '" + string + "'.");

 	 argument = parseInt(string);
 	 return addressing_direct;
 	}

 	// string ~ /\*[0-9]+/
 	function is_indirect(string)
 	{
 	 var repr;
 	 if (string.charAt(0) == "*")
 	 	{
 	 	 repr = string.substring(1, string.length);
 	 	 if (!isnumber(repr))
 	 	 	error("B��d w linii " + linenumber +  ": po znaku '*' spodziewano si� liczby ca�kowitej, jest '" + repr + "'.");

 	 	 argument = parseInt(repr);
 	 	 return addressing_indirect;
 	 	}
 	 else
 	 	return -1;
 	}

 	// string ~ /(direct|indirect|immediate)/
 	// zwraca kod operacji, ustawia zmienn� na warto�� argumentu
 	function decode_argument3(string)
 	{
 	 if (typeof(string) == "undefinied")
 	 	error("B��d w linii " + linenumber +  ": rozkaz wymaga argumentu (adresowanie po�rednie, bezpo�rednie, lub sta�a natychmiastowa).");

 	 var addressing;

 	 addressing = is_indirect(string);
 	 if (addressing != -1)
 	 	return addressing;

 	 addressing = is_immediate(string);
 	 if (addressing != -1)
 	 	return addressing;

 	 return is_direct(string);
 	}

 	// string ~ /(direct|indirect)/
 	// zwraca kod operacji, ustawia zmienn� na warto�� argumentu
 	function decode_argument2(string)
 	{
 	 if (typeof(string) == "undefinied")
 	 	error("B��d w linii " + linenumber +  ": rozkaz wymaga argumentu (adresowanie po�rednie albo bezpo�rednie).");

 	 var addressing = is_indirect(string);
 	 if (addressing != -1)
 	 	return addressing;

 	 return is_direct(string);
 	}

 	// string ~ /label/
 	// zwraca kod operacji, ustawia zmienn� na warto�� argumentu
 	function decode_label(string)
 	{
 	 if (typeof(string) == "undefinied")
 	 	error("B��d w linii " + linenumber +  ": rozkaz wymaga podania etykiety.");

 	 if (!isidentifier(string))
 	 	error("B��d w linii " + linenumber +  ": w nazwie etykiety ('" + string + "') wyst�puj� niedozwolone znaki.");

 	 argument = string;
 	 return addressing_jump;
 	}

 var i = 0; // numer pola;

 var label    = "";
 var opcode   = 0xff;
 var argument = 0x00;

/*
	Algorytm dzia�ania:
	1. je�li pierwsze pole jest liczb� ca�kowit� bez znaku,
	   to je zignoruj (numer wiersza)
	2. je�li nast�pne pole jest zako�czone dwukropkiem, to
	   musi to by� etykieta
	3. je�li nast�pne pole nie jest puste, to musi to by� rozkaz
	   je�li jest puste, a wcze�niej by�a etykieta to przyjmujemy domy�lnie rozkaz nop
 */

 if (isnumber(fields[i]))
 	i++;

 if (typeof(fields[i]) != "undefined") // jest nast�pne pole
 	{
 	 // 2. etykieta?
 	 switch (islabel(fields[i]))
 	 	{
 	 	 case 0: // to nie jest etykieta
 	 	 	 break;
 	 	 case 1: // etykieta;
 	 	 	 label = fields[i].substring(0, fields[i].length-1);
 	 	 	 i++;
 	 	 	 break;
 	 	 case 2: // b��dna etykieta
 	 	 	 error("B��d w linii " + linenumber +  ": w nazwie etykiety ('" + fields[i] + "') wyst�puj� nieprawid�ow znaki.");
 	 	 	 return -1;
 	 	}

 	 // 3.
 	 if (typeof(fields[i]) == "undefined")
 	 	{
 	 	 if (label != 0)
 	 	 	{
 	 	 	 opcode   = 0xc4;
 	 	 	 argument = 0x00
 	 	 	}
 	 	 else
 	 	 	error("B��d w linii " + linenumber +  ": brak rozkazu w tej linii.")
 	 	}
 	 else
 	 switch (fields[i])
 	 	{
 	 	 // rozkazy z argumentem: immediate, registers, indirect register
 	 	 case "load" : opcode = 0x00 + decode_argument3(fields[++i]); break;
 	 	 case "add"  : opcode = 0x20 + decode_argument3(fields[++i]); break;
 	 	 case "sub"  : opcode = 0x30 + decode_argument3(fields[++i]); break;
 	 	 case "mult" : opcode = 0x40 + decode_argument3(fields[++i]); break;
 	 	 case "div"  : opcode = 0x50 + decode_argument3(fields[++i]); break;
 	 	 case "write": opcode = 0x70 + decode_argument3(fields[++i]); break;

 	 	 // rozkazy z argumentem: register, indirect register
 	 	 case "store": opcode = 0x10 + decode_argument2(fields[++i]); break;
 	 	 case "read" : opcode = 0x60 + decode_argument2(fields[++i]); break;

 	 	 // rozkazy skoku
 	 	 case "jump" : opcode = 0x80 + decode_label(fields[++i]); break;
 	 	 case "jzero": opcode = 0x90 + decode_label(fields[++i]); break;
 	 	 case "jgtz" : opcode = 0xa0 + decode_label(fields[++i]); break;

 	 	 // rozkazy bez argument�w
 	 	 //case "nop"  : opcode = 0xc4; i++; break;
 	 	 case "halt" : opcode = 0xb4; i++; break;
 	 	 default:
 	 	 	error("B��d w linii " + linenumber +  ": nieznany rozkaz '" + fields[i] + "'.");
 	 	}

 	 if (i < fields.length-1)
 	 	warning("Ostrze�enie (" + linenumber +  "): wi�cej p�l ni� si� spodziewano: " + fields.slice(i+1) + ". Pole te zosta�y zignorowane.");

 	 return [linenumber, label, opcode, argument];
 	}
 return -1;
}

//**** eof *****************************************************************
