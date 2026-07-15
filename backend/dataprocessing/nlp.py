from functools import cache

HASH_STRENGTH_ORDER = [
    "RIPEMD", "MD4","MD5",
    "SHA-1",
    "SHA-256", "SHA-512",
    "SHA3-256", "SHA3-512",
    "PBKDF2",
    "bcrypt",
    "scrypt",
    "Argon2",
]

HASH_FUNCTION_ALIASES = {
    "SHA1": "SHA-1",
    "SHA256": "SHA-256",
    "SHA512": "SHA-512",
}


def _basicStringMatching(text:str):
    '''
    Derives features from given text using substring matching
    '''
    text = text.lower()
    # is hashed?
    isHashed = None
    if any([x in text for x in ("hashed","hashes")]):
        isHashed = True
    # Check for negation
    if any([x in text for x in ("not hashed","unhashed","plain text")]):
        isHashed = False
        isSalted = False # there are no hashes to salt

    if isHashed != False:
        # is salted
        isSalted = None
        if any([x in text for x in ("salted", "salt")]):
            isSalted = True
        # Check for negation
        if any([x in text for x in ("unsalted", "not salted", "no salt")]):
            isSalted = False
        if isSalted is not None: isHashed = True # there must be hashes to be salted/unsalted

    # Find the hash algorithm used
    hashAlgo = None
    if isHashed != False:
        # Check for a number of known algorithms
        # Check in order of hash strength so if multiple hashes used, we report the weakest used
        for a in HASH_STRENGTH_ORDER:
            if a.lower() in text:
                hashAlgo = a
                break
        
        # also check for aliases
        for k, v in HASH_FUNCTION_ALIASES.items():
            if k.lower() in text:
                hashAlgo = v
                break 
        
        if hashAlgo is not None:
            isHashed = True # there must be hashes for there to be a hash function used

    return (isHashed, isSalted, hashAlgo)


@cache # cache for speed
def nlp(text:str) -> tuple[bool|None, bool|None, str|None]:
    '''
    Extracts features isHashed, isSalted and hashAlgo from the given description text
    '''
    return _basicStringMatching(text)
