# RAM machine emulator
#
# License: GNU2
#
# Wojciech Mula
# wojciech_mula[at]poczta[dot]onet[dot]pl

import sys, emulator
from compiler import compile_code
from emulator import execute, dump_registers, in_tape, out_tape

def main():
	filename = ""
	for i in sys.argv:
		if   i.startswith("--file="):
			filename = i[7:]
			break
		elif i.startswith("-f="):
			filename = i[3:]
			break

	if not len(filename):
		print "--file=filename, or -f=name"
		return

	try:
		f = open(filename, "r")
		code = f.read()
		code = code.splitlines()
	except IOError, e:
		print e
		return
	
	print 'Parsing %s file...' % filename
	# parse
	try:
		bytecode = compile_code(code)
	except Exception, e:
		print e
		return

	# execute
	emulator.IP = 0
	try:
		while emulator.IP < len(bytecode):
			linenumber, instruction, argument = bytecode[emulator.IP]
			print `linenumber+1` + ': ' + code[linenumber]
			execute[instruction](argument)
			print dump_registers()
		
	except Exception, e:
		print e
		return

	print "input tape : " +  `emulator.in_tape`
	print "output tape: " + `emulator.out_tape`
	
main()
