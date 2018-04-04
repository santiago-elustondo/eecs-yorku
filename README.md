# **eecs-yorku**
### A command-line SSH client tool for submitting assignments through your York Univeristy Prism account.
-------------------------------------

## What's this for?

*&nbsp;&nbsp;&nbsp;&nbsp;York University gives us (students) accounts for the computer science department system (called Prism). We use our accounts to log into the lab computers, and they have this special program installed on them that we can use, from the terminal, to submit our work (text files, java files, etc). </br> &nbsp;&nbsp;&nbsp;&nbsp;We also have SSH access for our accounts, so we could do a lot of the work on our own computers and SSH in and submit them. <br /> &nbsp;&nbsp;&nbsp;&nbsp;eecs-york automates this process, so it feels like you have the Prism application on your own computer.*


## To use:
1) Install Node (v6.7.0^)<br />
2) Run this command on your terminal: 
```sh
$ npm install -g eecs-yorku
```
3) Set up your credentials with these two commands:
```sh
$  eecs-yorku set-user <your_username> 
$  eecs-yorku set-pass <your_password>
```
4) Test that it works with this command (it should give you the help page for the submit command):
```sh
$  eecs-yorku submit
```
5) To test the submission function run this command (replace the `<file_placeholders>` for real file names):
```sh
$   eecs-yorku submit fake_course fake_lab <a_file> <another_file>
```
6) the command above should return something like "there is no such course" (which means its working), and have uploaded your files to your prism account under /etc/home/`<your_username>`/submissions/fake_course/fake_lab


## API:
### set-user
```sh
$ eecs-yorku set-user <username>
``` 
Sets user to use for authorization. Stored in .json in user's home directory. 


### set-pass
```sh
$ eecs-yorku set-pass <password>
```
Sets password to use for authentication.

### submit
```sh
$ eecs-yorku submit <course> <assignment> <file> <another-file> ... 
```
    
Uploads all given files (any number of files) to your Prism account and then calls the submit program with the information given. It returns the output to you, so if your file wasn't accepted, you'll get the response (this includes the style-checker feedback). 

Whether your file is accepted or rejected, it is stored in your Prism account under /eecs/home/`<username>`/submissions/`<course>`/`<assignment>`. 

A new submission of the same file (whether successful or not) will overwrite the previous upload.

```sh
$ eecs-yorku submit
```
Calling submit with no further parameters will return the help page from the Prism application.
### show submission [not yet implemented]
```sh
$ eecs-yorku submit -l <course> <assignment>
```
Lists all files you have previously submitted for a specific assignment.

### upload [not yet implemented]
```sh 
$ eecs-yorku upload [dir] <file> <another-file> ...
```
Uploads a set of files without calling submit. A directory of choice within your account directory should be able to be selected. 

You can upload your files right now just by providing nonsensical course and assignment names (for example "xx"). You cannot currently select a directory, however. Your files will be stored in the submissions directory.

### set-rsa [not yet implemented]
```sh 
eecs-yorku set-rsa ...
```
Set up rsa authentication


