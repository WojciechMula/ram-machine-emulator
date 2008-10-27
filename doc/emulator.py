# RAM machine emulator
#
# License: GNU2
#
# Wojciech Mula
# wojciech_mula[at]poczta[dot]onet[dot]pl

import compiler

IP       = 0        # instruction pointer
registers= {0: 0l}  # registers
in_tape  = []       # input tape
out_tape = []       # output tape


class Halt:
	pass


def dump_registers():
	s = ""
	for i in registers.keys():
		s += "r%i=%i " % (i, registers[i])
	return s

def get_regval(n):
	"Returns value of n-th register."
	global registers
	if n < 0:
		raise "Runtime error: nagative register number!"
	else:
		if registers.has_key(n):
			return registers[n]
		else:
			registers[n]=0l
			return 0l

def set_regval(n, value):
	"Set value of n-th register."
	global registers
	if n < 0:
		raise "Runtime error: nagative register number!"
	else:
		registers[n] = value
		
def get_argval(arg):
	"""
	Returns value of an argument;
	arg is '=number', 'number', '*number'
	"""
	if   arg[0] == '=':
		return int(arg[1:])
	elif arg[0] == '*':
		return get_regval( get_regval(int(arg[1:])) )
	else:
		return get_regval(int(arg))
		
def set_argval(arg, value):
	"""
	Sets value to register (direct/indirect addressing)
	arg: 'number', '*number'
	"""
	if arg[0] == '*':
		return set_regval( get_regval(int(arg[1:])), value )
	else:
		return set_regval(int(arg), value)

# emulator functions		
def i_nop(arg=None):
	global IP
	IP += 1
	
def i_load(arg):
	global IP
	set_regval(0, get_argval(arg))
	IP+=1
	
def i_store(arg):
	global IP
	set_argval( arg,  get_regval(0) )
	IP+=1

def i_add(arg):
	global IP
	r0 = get_regval(0)
	rn = get_argval(arg)
	set_regval(0, r0+rn)
	IP+=1

def i_sub(arg):
	global IP
	r0 = get_regval(0)
	rn = get_argval(arg) 
	set_regval(0, r0-rn)
	IP+=1

def i_mult(arg):
	global IP
	r0 = get_regval(0)
	rn = get_argval(arg)
	set_regval(0, r0*rn)
	IP+=1

def i_div(arg):
	global IP
	r0 = get_regval(0)
	rn = get_argval(arg)
	if rn: 
		set_regval(0, r0/rn)
	else:
		raise "Runtime error: division by zero."
	IP+=1

def i_read(arg):
	global IP
	
	while True:
		try:
			i = int(raw_input("read: "))
			break
		except:
			pass
			
	in_tape.append(i)
	set_argval( arg, i )
	IP+=1

def i_write(arg):
	global IP
	out_tape.append( get_argval(arg) )
	IP+=1

def i_jump(arg):
	global IP
	IP = compiler.labels[arg]

def i_jzero(arg):
	global IP
	if get_regval(0) == 0:
		IP = compiler.labels[arg]
	else:
		IP += 1

def i_jgtz(arg):
	global IP
	if get_regval(0) > 0:
		IP = compiler.labels[arg]
	else:
		IP += 1

def i_halt(arg):
	raise Halt


execute = { \
	"NOP"  : i_nop,   \
	"LOAD" : i_load,  \
	"STORE": i_store, \
	"ADD"  : i_add,   \
	"SUB"  : i_sub,   \
	"MULT" : i_mult,  \
	"DIV"  : i_div,   \
	"READ" : i_read,  \
	"WRITE": i_write, \
	"JUMP" : i_jump,  \
	"JZERO": i_jzero, \
	"JGTZ" : i_jgtz,  \
	"HALT" : i_halt
}

# eof
