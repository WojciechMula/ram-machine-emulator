/*
	**** Emulator maszyny RAM ****

	::Wirtualna maszyna RAM::

	Wojciech Mu�a, kwiecie� 2003
	wojciech_mula(at)poczta(dot)onet(dot)pl

	License GPL2 or later (see http://www.gnu.org for details)

	(cp=windows-1250)
 */


//**** funkcje globalne ****************************************************
/*

 function emulator_init()
 -- inicjuje zmienne lokalne

 function emulator_enable(enable)
 -- w��cza/wy��cza interfejs emulatora

 function emulator_reset_machine()
 -- resetuje maszyn� i ustawia IP na pocz�tek programu

 function emulator_halt_machine()
 -- zatrzymuje maszyn�

 function emulator_stop()
 -- ko�czy emulacj�
*/

function emulator_enable(enable)
{
 document._machine.exec.disabled    = !enable;
 document._machine.reset.disabled   = !enable;
 document._machine.stop.disabled    = !enable;
 document._machine.display.disabled = !enable;
}


function emulator_init()
{
 __vm_IP      = 0;
 __vm_running = 1;
 registers = new Registers();

 document._machine.display.value = "";
}

function emulator_reset_machine()
{
 __vm_running = 1;

 registers = new Registers();
 __vm_set_IP(0);
}

function emulator_halt_machine()
{ __vm_running = 0 }

function emulator_stop()
{
 information("Emulator zatrzymany.");
 emulator_halt_machine();
 editor_mode();
}

function execute_instruction()
{
 if (!__vm_running) return;

 try {
 	__execute_instruction();
 }
 catch (e)
 {
  emulator_stop();
  return;
 }
}

//**** funkcje lokalne *****************************************************
/*
 function __vm_get_physicalreg(regnumber)
 -- zwraca warto�� *fizycznego* rejestru o numerze 'regnumber'

 function __vm_set_physicalreg(regnumber, value)
 -- ustawia rejest *fizyczny* o numerze regnumber na warto�� 'value'

 function __vm_get_content(addressing, x)
 -- zwraca zawarto�� zakodowan� tupl�
    [adresowanie ('addressing'), argument ('x')]

 function __vm_set_content(addressing, x, newvalue)
 -- ustawia zawarto�� zakodowan� tupl�
    [adresowanie ('addressing'), argument ('x')]
    na warto�� 'newvalue'

 function __vm_set_IP(new_IP)
 -- ustawia IP na 'new_IP'

 function __execute_instruction()
 -- wykunuje instrukcj� wskazywan� przez IP
*/

function __vm_set_IP(new_IP)
{
 __vm_IP = new_IP;

 if (__vm_IP >= bytecode.length)
 	{
 	 warning("Program zako�czony - nie ma wi�cej instrukcji do wykonania. Brakuje instrukcji 'halt' w jednej z ga��zi programu.");
 	 watch_update_view();
 	 emulator_halt_machine();
 	 return;
 	}

 // wy�wietl bie��c� instrukcj�
 var ip   = __vm_IP;
 var linenum = bytecode[ip][0];
 var p="",c="",n="";            // zawarto�� linii
 var maxlength = document._machine.display.cols-7;

 function padding(max, value)
 {
  var f = "       " + value;
  return f.substring(f.length-max);
 }

 if (linenum-1 >= 0)
 	 p = "  " + padding(3, linenum-1) + ": " + source_code[linenum-1].substring(0, maxlength);

 if (linenum+1 < source_code.length)
 	 n = "  " + padding(3, linenum+1) + ": " + source_code[linenum+1].substring(0, maxlength);

 c = "=>" + padding(3, linenum) + ": "  + source_code[linenum].substring(0, maxlength);

 document._machine.display.value = p + "\n" + c + "\n" + n;

 // uaktualnia widok w 'watches'
 watch_update_view();
}

function __vm_get_physicalreg(regnumber) {
	if (regnumber < 0)
		error("B��d wykonywania: numer rejestru nie mo�e by� ujemny (" + regnumber + ").");
	else
		return registers.get(regnumber);
}

function __vm_set_physicalreg(regnumber, value) {
	if (regnumber < 0)
		error("B��d wykonywania: numer rejestru nie mo�e by� ujemny (" + regnumber + ").");
	else
		registers.set(regnumber, value);
}

function __vm_get_content(addressing, x)
{
 var tmp;
 switch (addressing)
 	{
 	 case addressing_immediate: // sta�a natychmiastowa
 	 	return x;
 	 	break;
 	 case addressing_direct:    // indeks rejestru
 	 	return __vm_get_physicalreg(x);
 	 	break;
 	 case addressing_indirect:  // adresowanie po�rednie
 	 	return __vm_get_physicalreg( __vm_get_physicalreg(x) );
 	 	break;
 	 default:
 	 	error("B��d wewn�trzny, skontaktuj si� z autorem.\nW funkcji machine.get_content: addressing=='" + addressing + "')." );
 	 	emulator_halt_machine();
 	}
}

function __vm_set_content(addressing, x, newvalue)
{
 var tmp;
 switch (addressing)
 	{
 	 case addressing_direct:    // indeks rejestru
 	 	__vm_set_physicalreg(x, newvalue);
 	 	break;
 	 case addressing_indirect:  // adresowanie po�rednie
 	 	__vm_set_physicalreg( __vm_get_physicalreg(x), newvalue );
 	 	break;
 	 default:
 	 	error("B��d wewn�trzny, skontaktuj si� z autorem.\nW funkcji machine.__vm_set_content: addressing=='" + addressing + "')." );
 	 	emulator_halt_machine();
 	}
}

function __execute_instruction()
{
 var op  = (bytecode[__vm_IP][1] >> 4) & 0x0f; // kod operacji
 var adr = (bytecode[__vm_IP][1] >> 0) & 0x0f; // tryb adresowania
 var operand = bytecode[__vm_IP][2];

 var a, b;
 var inc = 0;

 switch (op)
 	{
 	 case 0x0: // load
 	 	__vm_set_physicalreg(0, __vm_get_content(adr,  operand) );
 	 	__vm_set_IP(__vm_IP+1);
 	 	break;

 	 case 0x1: // store
                __vm_set_content(adr, operand, __vm_get_physicalreg(0) );
 	 	__vm_set_IP(__vm_IP+1);
 	 	break;

 	 case 0x2: // add
 	 	a = __vm_get_physicalreg(0);
 	 	b = __vm_get_content(adr, operand);
 	 	__vm_set_physicalreg(0, a+b);
 	 	__vm_set_IP(__vm_IP+1);
 	 	break;
 	 case 0x3: // sub
 	 	a = __vm_get_physicalreg(0);
 	 	b = __vm_get_content(adr, operand);
 	 	__vm_set_physicalreg(0, a-b);
 	 	__vm_set_IP(__vm_IP+1);
 	 	break;
 	 case 0x4: // mult
 	 	a = __vm_get_physicalreg(0);
 	 	b = __vm_get_content(adr, operand);
 	 	__vm_set_physicalreg(0, a*b);
 	 	__vm_set_IP(__vm_IP+1);
 	 	break;

 	 case 0x5: // div
 	 	a = __vm_get_physicalreg(0);
 	 	b = __vm_get_content(adr, operand);
 	 	if (b == 0)
 	 		error("B��d wykonywania: dzielenie przez zero!");
 	 	else
 	 		{
 	 		 __vm_set_physicalreg(0, Math.floor(a/b) );
 	 		 __vm_set_IP(__vm_IP+1);
 	 		}
 	 	break;

 	 case 0x8: // jump
 	 	if (adr != addressing_jump)
 	 		error("Z�y opkod - niew�a�ciwy tryb adresowania: '" + bytecode[__vm_IP] + "'.");
 	 	else
 	 		__vm_set_IP(operand);
 	 	break;
 	 case 0x9: // jzero
 	 	if (adr != addressing_jump)
 	 		error("Z�y opkod - niew�a�ciwy tryb adresowania: '" + bytecode[__vm_IP] + "'.");
 	 	else
 	 		if (__vm_get_physicalreg(0) == 0x00)
 	 			__vm_set_IP(operand);
 	 		else
 	 			__vm_set_IP(__vm_IP+1);

 	 	break;
 	 case 0xa: // jgtz
 	 	if (adr != addressing_jump)
 	 		error("Z�y opkod - niew�a�ciwy tryb adresowania: '" + bytecode[__vm_IP] + "'.");
 	 	else
 	 		if (__vm_get_physicalreg(0) > 0)
 	 			__vm_set_IP(operand);
 	 		else
 	 			__vm_set_IP(__vm_IP+1);

 	 	break;

 	 case 0xc: // nop
 	 	if (adr != addressing_void)
 	 		error("Z�y opkod - niew�a�ciwy tryb adresowania: '" + bytecode[__vm_IP] + "'.");
 	 	else
 	 		__vm_set_IP(__vm_IP+1);
 	 	break;
 	 case 0xb: // halt
 	 	if (adr != addressing_void)
 	 		error("Z�y opkod - niew�a�ciwy tryb adresowania: '" + bytecode[__vm_IP] + "'.");
 	 	else
 	 		information("Program zako�czony - wykonano instrukcj� halt.");
 	 	emulator_halt_machine();
 	 	break;
 	 case 0x6: // read
 	 	__vm_set_content(adr, operand, intape_get() );
 	 	__vm_set_IP(__vm_IP+1);
 	 	break;
 	 case 0x7: // write
 	 	outtape_put(__vm_get_content(adr, operand) );
 	 	__vm_set_IP(__vm_IP+1);
 	 	break;
 	 default:
 	 	error("Nieznany opkod '" + bytecode[__vm_IP] + "'.");
 	}
}

//**** lokalne zmienne *****************************************************
var __vm_IP;      // wska�nik instrukcji
var __vm_running;

//**** eof *****************************************************************
