# Passwd: A password manager on Blockchain

If you have a Metamask wallet that is connected to Avalanche Fuji testnet, you can directly [try out the project](https://passwd-v01.netlify.app/).

This is a work in progress, do not store critical data! Also licensing will be figured out later.

## Benefits
A password manager on blockchain definitely has some properties that the conventional ones don't.
- I think most people do not rotate their passwords as often as they should, writing rarely and reading frequently is really in line with current blockchain access patterns.
- This has the side effect of only paying transaction fees on writes, reads are free forever. No one can decide that you do not have access to your passwords anymore, no one can prevent you using this service.
- Also there aren't any centralized servers. Which means there are no servers to fail, no company to go bankrupt. You have complete ownership over your data.

## Method
We use the Metamask encryption/decryption functionality to make upstream public data only readable by you. This way is chosen because
1. This was the fastest way we can come up to arrive to a working prototype
2. Metamask prompts look pretty cool and add credibility :)

Contract side is only a simple 1-level key-value store. The complete state is encrypted in one go for every modification. All the logic lives on the client.

## Future work
- For a password manager to succeed, it ***must*** be usable across multiple platforms comfortably. 
- Offline cached passwords will be a breeze to implement since you can safely store encrypted data locally, in the same way you store it upstream.
- Multiple wallet integrations are a must, as far as I can see Trust wallet has way wider adoption by mobile users.
- Some features like generating passwords, autofill and shared passwords and such are in the works.
- Since only blobs are to be read, it would be easy to integrate a CDN for read only access.
- Using passwords is clunky. You can sign a message for a given app and it can reach the blockchain to check if you truly are who you are claiming to be. Just like Google Auth.
- Storing and modifying the whole state altogether is inefficient at best. We can come up with different schemas allowing more granular access, however in cryptology one cannot be too careful. Giving away information that you thought was irrelevant and insignificant for comfort is a sure way to get hacked.
- Last but not least, we *need* to spend some effort to verify that we make use of the correct libraries, in the way they are meant to be used. We need to study concepts like 'salting' and 'peppering' ([I kid you not](https://www.youtube.com/watch?v=FvstbO787Qo)) to make sure our data is safe out in the open, in one of the most publicly accessible databases ever.
