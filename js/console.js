/*
	**** Emulator maszyny RAM ****

	::Konsola::

	Wojciech Mu³a, kwiecieñ 2003
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */


//**** funkcje globalne ****************************************************
/*

 function init_console()
 -- incjuje konsole

 function error(info)
 -- wyœwietla komunikat b³êdu, *rzuca wyj¹tkiem*

 function warning(info)
 -- wyœwietla ostrze¿enie

 function information(info)
 -- wyœwietla zwyk³¹ informacjê

 function clear_console()
 -- czyœci konsole
*/

function init_console()
{
 clear_console();
}

function error(info)
{
 if (document._console.err2con.checked)
 	document._console.display.value += "! " + info + "\n";
 if (document._console.err2win.checked)
 	alert(info);

 throw info;
}

function warning(info)
{
 if (document._console.wrn2con.checked)
 	document._console.display.value += "* " + info + "\n";
 if (document._console.wrn2win.checked)
 	alert(info);
}

function information(info)
{
 if (document._console.inf2con.checked)
 	document._console.display.value += "# " + info + "\n";
 if (document._console.inf2win.checked)
 	alert(info);
}

function clear_console()
{ document._console.display.value = ""; }

//**** eof *****************************************************************

