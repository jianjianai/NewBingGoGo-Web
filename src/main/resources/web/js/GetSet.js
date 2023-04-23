let ChatHubWithMagic = document.getElementById("ChatHubWithMagic");

async function setMagicUrl(url) {
	return await chrome.storage.local.set({
		GoGoUrl: url
	});
}

async function getMagicUrl() {
	return window.location.origin;
}

// ture|false
async function getChatHubWithMagic() {
	return ChatHubWithMagic.checked;
}







