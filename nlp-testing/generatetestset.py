DEFAULT_SAMPLES = 10

import json
import math
import argparse
import random

# Utility function for getting input
clean_input = lambda prompt : input(prompt).strip()

if __name__=="__main__":
    # handle arguments
    argparser = argparse.ArgumentParser(description="Utility program for generating a labelled set for testing NLP on HIBP data")
    argparser.add_argument("--samples", "-s", type=int, required=False, default=DEFAULT_SAMPLES, help=f"Number of samples to use, default={DEFAULT_SAMPLES}")
    argparser.add_argument("--input", "-i", default="original.json", required=False, help="Input file from which samples are taken")
    argparser.add_argument("--output", "-o", default="testset.json", required=False, help="Testset output file")
    args = argparser.parse_args()

    samples = args.samples

    # Load in original data from file
    with open(args.input, "r") as fp:
        original_data :list= json.load(fp)
        
    # Filter for only breaches that contain passwords
    original_data = [x for x in original_data if "Passwords" in x["DataClasses"]]

    # Sort by date and use interval selection to cover changes in writing style over time
    original_data.sort(key=lambda x : x["AddedDate"])
    interval = len(original_data) / samples

    # Add a random offset for the first sample selected
    start = random.randrange(0, math.floor(interval))
    
    # The output
    testset = []
    
    # Cache of common algorithms and those that the user has already entered to simplify future inputs
    known_algos = ["MD5", "SHA-1"]

    for i in range(samples):
        item = original_data[start + math.floor(i*interval)]

        print("--------------------------")
        print(item["Description"])

        # User reads the description shown to them then answers the following questions for labelling:

        # Ask whether the passwords are hashed
        ans = clean_input("Passwords were hashed? (y/n/u) ").lower()
        hashed = True if ans == "y" else False if ans == "n" else None

        # If passwords are hashed, then also ask about the hash algorithm and if it's salted
        algo = None
        salted = None
        if hashed: 
            ans = clean_input(f"Hash algorithm? ({", ".join([f"{id}: {x}" for id, x in enumerate(known_algos)])} / u) ")
            if ans.lower() == "u": algo = None
            elif ans.isnumeric() and int(ans) in range(len(known_algos)):
                algo = known_algos[int(ans)]
            else:
                algo = ans
                if algo not in known_algos: known_algos.append(algo)
            
            ans = clean_input("Was the hash salted? (y/n/u) ").lower()
            salted = True if ans == "y" else False if ans == "n" else None

        testset.append({
            "description":item["Description"], 
            "isHashed": hashed,
            "algorithm": algo,
            "isSalted": salted
        })

    # Write testset to file
    with open(args.output, "w") as fp:
        json.dump(testset, fp, indent=4)