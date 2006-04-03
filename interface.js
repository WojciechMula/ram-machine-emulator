/*
	**** Emulator maszyny RAM ****

	::main::

	Wojciech Mu³a, kwiecieñ 2003
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */


//**** funkcje globalne ****************************************************

function init()
{
 compiler_init();
 init_console();
 watch_init();
 intape_init();
 outtape_init();
 emulator_init();

 editor_mode();
}

function __mode(bool)
{
 compiler_enable(bool);
 watch_enable(!bool);
 intape_enable(!bool);
 outtape_enable(!bool);
 emulator_enable(!bool);
}

function editor_mode()
{ __mode(true); }

function emulation_mode()
{ __mode(false); }

//**** eof *****************************************************************
