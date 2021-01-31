#!/usr/bin/env /bin/bash

set -ex

mkdir -p /tmp/json-grammar
java -jar $ANTLR_JAR src/parser/JSON.g4 -o /tmp/json-grammar 
javac -cp $ANTLR_CLASSPATH /tmp/json-grammar/src/parser/*.java
cd /tmp/json-grammar/src/parser
java -cp $ANTLR_CLASSPATH org.antlr.v4.gui.TestRig JSON json -gui
