(*
	The RAM machine emulator

	Wojciech Mu³a
	wojciech_mula#poczta!onet!pl 	# = @	! = .

$Id: ram_machine.sml,v 1.1.1.1 2006-04-03 18:20:34 wojtek Exp $
*)

Meta.quietdec := true;

load "TextIO";
load "List";
load "Int";
load "String";
load "Char";

open TextIO;

fun get(L,i)	= List.nth(L,i);
fun put(L,i,x)	=
	if i=0 then
		x::List.drop(L,1)
	else
		List.take(L,i) @  [x] @ List.drop(L,i+1);

(* joins list of strings, inserts S between elements *)
fun join(_, [])    = ""
  | join(S,   [s]) = s
  | join(S, s::xs) = s^S^join(S,xs);

(* string representation of list of integeres *)
fun repr(x) = "["^join(", ", List.map Int.toString x)^"]";

fun write(s)	= (output(stdOut, s); flushOut(stdOut));
fun writeln(s)	= (output(stdOut, s^"\n"); flushOut(stdOut));

exception DoJump of string; (* exception is raised by jump instructions *)
exception Halt of string;   (* exception is raised by halt instruction or
                                when end of instruction's list is reached *)
exception ByteCodeError;    (* exception is reaised when complier failed
                               (impossible!) *)


datatype Operand = (* instruction's operands *)
	Immediate	of int		(* A := val *)
|	Direct		of int		(* A := reg[index] *)
|	Indirect	of int		(* A := reg[reg[index]] *)
|	Label		of string	(* jump label *)
|	Empty;				(* halt has no arguments *)

datatype Instruction =
	LOAD	of Operand
|	STORE	of Operand
|	ADD	of Operand
|	SUB	of Operand
|	MULT	of Operand
|	DIV	of Operand
|	READ	of Operand
|	WRITE	of Operand
|	JUMP	of Operand
|	JZERO	of Operand
|	JGTZ	of Operand
|	HALT;

(**********************************************************************)
(** COMPILER **********************************************************)
(**********************************************************************)

(* find_label is used by both compiler and runtime *)
exception NoLabel of string
fun find_label(bytecode, label) =
let
	fun doit(index,    []) =
		raise NoLabel ("label '"^label^"' not found" )
	  | doit(index, (NONE,_)::bt) =
		doit(index+1, bt)
	  | doit(index, (SOME label',_)::bt) =
	  	if label = label' then
			index
		else
			doit(index+1, bt)
in
	doit(0, bytecode)
end;

local

exception CompilerError of string;
exception EmptyLine; (* raises by 'compile_line' when it get an empty line *)

(*
	Check if string 's' matches regexp: "^\([a-z]+\):$"
	Return SOME \1 or NONE
*)
fun getLabel(s) =
let
	fun isLabel(   []) = true
	  | isLabel(  [s]) = s = #":"
	  | isLabel(s::xs) = (Char.isAlpha s) andalso isLabel(xs);

	fun takeAllButOne(   []) = []
	  | takeAllButOne(  [s]) = []
	  | takeAllButOne(x::xs) = x::takeAllButOne(xs);

	val l = String.explode s
in
	if isLabel(l) then
		SOME (String.implode (takeAllButOne l))
	else
		NONE
end;

(*
	Recognizes operand of instruction:
	1. =number
	2. *number
	3.  number
	4.  label
*)
fun getOperand(s) =
let
	val f = String.substring(s,0,1)
	val v = if f = "*" orelse f = "=" then
	           Int.fromString(String.substring (s,1,size(s)-1) )
		else
		   Int.fromString(s)
in
	case v of
	NONE   => Label s |
	SOME x => (case f of
		     "*" => Indirect x
		   | "=" => Immediate x
		   |   _ =>
		   	if x < 0 then
				raise CompilerError "register number < 0"
			else
				Direct x)
end;

(*
	Compile single line of code. If line is empty raises EmptyLine.
	It recognizes following syntax:
	* "label: instruction operands # comment"
	* "       instruction operands # comment"
	* "label: halt # comment"

	Returns a tuple:
	(SOME label or NONE, Instruction)
*)
fun compile_line(s) =
let
	fun drop_comments([])    = []
	  | drop_comments(s::xs) =
	  if s = "#" then
	  	[]
	  else
  		s::drop_comments(xs);
	
	val s  = implode (map Char.toLower (explode s))
	val s' = drop_comments(String.tokens Char.isSpace s)

	val (label, instruction, opcode) = case s' of
	[a,b,c] => (getLabel(a), b, getOperand(c)) |
	[a,b]   =>
		let
			val a' = getLabel(a)
		in
			case a' of
			NONE       => (NONE, a, getOperand(b)) |
			SOME label => if b = "halt" then
			                 (SOME label, b, Empty)
				      else
				         raise CompilerError "halt expeced"
		end |
	[a]     => 
		if a = "halt" then
			(NONE, a, Empty)
		else
			raise CompilerError "halt expeced" |
	[]	=> raise EmptyLine |
	_       => raise CompilerError ("sytax error '" ^ join(" ", s') ^ "'")

	(* replace string with Instruction *)
	val instruction' = case instruction of
		"load"		=> LOAD  opcode
	|	"store"		=> STORE opcode
	|	"add"		=> ADD   opcode
	|	"sub"		=> SUB   opcode
	|	"mult"		=> MULT  opcode
	|	"div"		=> DIV   opcode
	|	"read"		=> READ  opcode
	|	"write"		=> WRITE opcode
	|	"jump"		=> JUMP  opcode
	|	"jzero"		=> JZERO opcode
	|	"jgtz"		=> JGTZ  opcode
	|	"halt"		=> HALT
	|	_     		=>
		raise CompilerError ("unknown instruction '"^instruction^"'")
in
	(label, instruction')
end;

in

(*
	Returns a bytecode for program stored in file.
*)
fun compile_file(filename) =
let
	val instream = openIn(filename)
	fun walk(bytecode) =
		if endOfStream(instream) then
			bytecode
		else
		let
			val line = inputLine(instream)
		in
			walk(bytecode @ [compile_line(line)])
			handle EmptyLine => walk(bytecode)
		end

	val bytecode = walk([]) before closeIn(instream)

	fun check_labels( []) =
		bytecode
	  | check_labels((_,JUMP  (Label label))::bs) =
	  	(find_label(bytecode, label); check_labels(bs))
	  | check_labels((_,JZERO (Label label))::bs) =
	  	(find_label(bytecode, label); check_labels(bs))
	  | check_labels((_,JGTZ  (Label label))::bs) =
	  	(find_label(bytecode, label); check_labels(bs))
	  | check_labels(_::bs) =
		 check_labels(bs)
in
	check_labels(bytecode)
	handle NoLabel label => raise CompilerError ("label '"^label^"' doesn't exist")
end;

end;

(**********************************************************************)
(** RUNTIME ***********************************************************)
(**********************************************************************)

local
(* Exec runs single instruction in specific cotext of
   RAM (registers) and tapes.

   Returns (modified) RAM and tapes or raises DoJump exception.
*)
fun exec(LOAD arg, RAM, InTape, OutTape) =
    let
        val RAM' = 
	case arg of
		Immediate x	=> put(RAM, 0, x)
	|	Direct i	=> put(RAM, 0, get(RAM, i))
	|	Indirect i	=> put(RAM, 0, get(RAM, get(RAM, i)))
	|	_		=> raise ByteCodeError
    in
    	(RAM', InTape, OutTape)
    end

  | exec(STORE arg, RAM, InTape, OutTape) =
    let 
	val RAM' =
	case arg of
		Direct i	=> put(RAM, i, get(RAM, 0))
	|	Indirect i	=> put(RAM, get(RAM, i), get(RAM, 0))
	|	_		=> raise ByteCodeError
    in
    	(RAM', InTape, OutTape)
    end
  | exec(ADD arg, RAM, InTape, OutTape) =
    let
    	val y = get(RAM, 0)
    	val x = case arg of
		Immediate x	=> x
	|	Direct i	=> get(RAM, i)
	|	Indirect i	=> get(RAM, get(RAM, i))
	|	_		=> raise ByteCodeError
    in
    	(put(RAM, 0, x+y), InTape, OutTape)
    end
  | exec(SUB arg, RAM, InTape, OutTape) =
    let
    	val y = get(RAM, 0)
    	val x = case arg of
		Immediate x	=> x
	|	Direct i	=> get(RAM, i)
	|	Indirect i	=> get(RAM, get(RAM, i))
	|	_		=> raise ByteCodeError
    in
    	(put(RAM, 0, y-x), InTape, OutTape)
    end
  | exec(MULT arg, RAM, InTape, OutTape) =
    let
    	val y = get(RAM, 0)
    	val x = case arg of
		Immediate x	=> x
	|	Direct i	=> get(RAM, i)
	|	Indirect i	=> get(RAM, get(RAM, i))
	|	_		=> raise ByteCodeError
    in
    	(put(RAM, 0, x*y), InTape, OutTape)
    end
  | exec(DIV arg, RAM, InTape, OutTape) =
    let
    	val y = get(RAM, 0)
    	val x = case arg of
		Immediate x	=> x
	|	Direct i	=> get(RAM, i)
	|	Indirect i	=> get(RAM, get(RAM, i))
	|	_		=> raise ByteCodeError
    in
    	(put(RAM, 0, y div x), InTape, OutTape)
    end
  | exec(READ arg, RAM, InTape, OutTape) =
    let
	fun read_num() =
		(case (write("read: "); Int.fromString(input(stdIn))) of
		SOME x => x | NONE   => read_num())
		handle Overflow => read_num();

    	val x = read_num()
    	val InTape' = InTape @ [x]
	val RAM' = case arg of
		Direct i	=> put(RAM, i, x)
	|	Indirect i	=> put(RAM, get(RAM, i), x)
	|	_		=> raise ByteCodeError
    in
    	(RAM', InTape', OutTape)
    end
  | exec(WRITE arg, RAM, InTape, OutTape) =
    let
    	val x = case arg of
		Immediate x	=> x
	|	Direct i	=> get(RAM, i)
	|	Indirect i	=> get(RAM, get(RAM, i))
	|	_		=> raise ByteCodeError

	val OutTape' = OutTape @ [x]
    in
    	(RAM, InTape, OutTape')
    end
  | exec(JUMP (Label label), RAM, InTape, OutTape) =
  	raise DoJump label
  | exec(JZERO (Label label), RAM, InTape, OutTape) =
        if get(RAM, 0) = 0 then
		raise DoJump label
	else
		(RAM, InTape, OutTape)
  | exec(JGTZ (Label label), RAM, InTape, OutTape) =
        if get(RAM, 0) > 0 then
		raise DoJump label
	else
		(RAM, InTape, OutTape)
  | exec(HALT, RAM, InTape, OutTape) =
  	raise Halt "program has stopped"
  | exec(_) =
  	raise ByteCodeError;

in

fun Run(bytecode) =
let
	fun zeros(0) = []
	  | zeros(i) = 0::zeros(i-1)

	val n = List.length(bytecode)

	fun doit(index, (RAM, InputTape, OutTape) ) =
	if index >= n then
		(RAM, InputTape, OutTape)
	else
	let
		val instr = #2 (List.nth(bytecode, index))
	in
		doit(index+1, exec(instr, RAM, InputTape, OutTape))
		handle Halt _ => (RAM, InputTape, OutTape)
	end handle DoJump label =>
		let
			val index' = find_label(bytecode, label)
		in
			doit(index', (RAM, InputTape, OutTape))
			handle Halt _ => (RAM, InputTape, OutTape)
		end
in
	doit(0, (zeros(100), [], []))
end;

end;

(**********************************************************************)
(** RUNTIME ***********************************************************)
(**********************************************************************)

load "CommandLine";

fun CompileAndRun(name) =
    let
    	val bytecode = compile_file(name);
	val (RAM, it, ot) = Run(bytecode);
    in
    	(
	 writeln("REGISTERS = "^repr(RAM));
	 writeln("IN  TAPE = "^repr(it));
	 writeln("OUT TAPE = "^repr(ot))
	)
    end;

val argv = CommandLine.arguments();
val argc = length(argv);
CompileAndRun(List.nth(argv, argc-1));
quit();

(* eof *)
