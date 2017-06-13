from django.shortcuts import render


def index(request):
	import datetime
	today = datetime.datetime.now() 
	user_agent = request.environ['HTTP_USER_AGENT']
	context = {"today":today,'user_agent':user_agent}

	return render(request, 'index.html', context)

def about(request):
	return render(request, 'about.html', {})

def joy(request):
	return render(request, 'joy.html', {})

def community(request):
	return render(request, 'community.html', {})

def team(request):
	memberName = ['Billy Lin','Robert Chang','Jiang I an','Sandman Lo','Johnny Han']
	memberJob = ['Leader/Full stack developer','Full stack developer','Designer',' Art designer','Data analyst']
	memberEmail = ['tkubb@gms.tku.edu.tw','a22780911@gmail.com','ian9518527536@4gmail.com','timmy1166@gmail.com','johnny90513@gmail.com']
	memberDetail = ['I specialize in mobile applications,data minning,machine leaning.','',' I want to go shrimping','','I am the best']
	memberPhoto = ['billy.jpg','robert.jpg','jiang.jpg','lo.jpg','jj.jpg']
	memberList  = []
	for x in range(len(memberName)):
		tempDict = {'name':memberName[x],'job':memberJob[x],'email':memberEmail[x],'detail':memberDetail[x],'photo':memberPhoto[x]}
		memberList.append(tempDict)
	memberCotext = {'memberList':memberList}
	return render(request, 'team.html', memberCotext)