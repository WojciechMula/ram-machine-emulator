# RAM machine emulator
#
# License: GNU2
#
# Wojciech Mula
# wojciech_mula[at]poczta[dot]onet[dot]pl

import re

# regexps
Number  = re.compile('[0-9]+')
Label   = re.compile('[a-zA-Z_][0-9a-zA-Z_]*:')

arg_label     = re.compile('[a-zA-Z_][0-9a-zA-Z_]*')
arg_immediate = re.compile('=[+-]?[0-9]+')
arg_register  = re.compile('[0-9]+')
arg_indirect  = re.compile('\\*[0-9]+')

# instructions name
instructions1 = ["LOAD", "ADD", "SUB", "MULT", "DIV", "WRITE"]
instructions2 = ["STORE", "READ"]
instructions3 = ["JUMP", "JZERO", "JGTZ"]
instructions4 = ["HALT"]

labels   = {}	# labels is dictionary, where keys are label name, 
		# values are indexes in bytecode list
		
bytecode = []	# bytecode is triple of:
		#	(linenumber,
		#	 instruction name,
		#	 argument)

jump_dest = []
	       
def compile_code(code):
	"""
	returns bytecode
	"""
	global labels, bytecode, jump_dest
	labels   = {}
	bytecode = []
	jump_dest= []

	for i in xrange(len(code)):
		compile_line(code[i], i)

	for i in jump_dest:
		if not i in labels.keys():
			raise "Label '%s' not defined!" % (i,)
			
	return bytecode

def compile_line(string, linenumber):
	"""
	[line number] [label:] instruction [arg] [# comment]
	"""
	try:				# strip comments
		c = string.index('#')
		string = string[:c]
	except:
		pass

	fields = string.expandtabs().replace(':', ': ').split()
	
	instr = None
	label = None
	arg   = None
	
	if len(fields)==0:		# no fields
		return

	if Number.match(fields[0]):	# first fields is line number
		del fields[0]		# ignore one
		if len(fields)==0:	# if no fields break
			return

	if Label.match(fields[0]):
		label = fields[0][:-1].upper()
		del fields[0]
		if len(fields)==0:
			if labels.has_key(label):
				raise "Error at line %i: label '%s' already defined." % (linenumber, label)

			labels[label] = len(bytecode)
			bytecode.append( (linenumber, "NOP", None) )
			return
			
	instr  = fields[0].upper()
	if instr in instructions1:
		del fields[0]

		if arg_immediate.match(fields[0]) or \
		   arg_register .match(fields[0]) or \
		   arg_indirect .match(fields[0]):
			arg = fields[0]
			del fields[0]
		else:
			raise "Error at line %i: invalid argument '%s'" % (linenumber, fields[0])

	elif instr in instructions2:
		del fields[0]

		if arg_register .match(fields[0]) or \
		   arg_indirect .match(fields[0]):
			arg = fields[0]
			del fields[0]
		else:
			raise "Error at line %i: invalid argument '%s'" % (linenumber, fields[0])

	elif instr in instructions3:
		del fields[0]
		
		if arg_label.match(fields[0]):
			arg = fields[0].upper()
			jump_dest.append(fields[0].upper())
			del fields[0]
		else:
			raise "Error at line %i: invalid label name '%s'" % (linenumber, fields[0])

	elif instr in instructions4:
		del fields[0]
	else:
		raise "Error at line %i: '%s' is not valid RAM machine instruction." % (linenumber, fields[0])
		
	if len(fields):
		raise "Error at line " + `linenumber` + ": extra tokens " + `fields` + "."

	if label:
		if labels.has_key(label):
			raise "Error at line %i: label '%s' already defined." % (linenumber, label)
		labels[label] = len(bytecode)
	bytecode.append( (linenumber, instr, arg) )

#eof
