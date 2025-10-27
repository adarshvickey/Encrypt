import zipfile
import itertools
import string
import sys
from tqdm import tqdm  # For the progress bar (install with: pip install tqdm)

def check_if_encrypted(zip_file_path):
    """
    Checks if any file in the zip archive is truly encrypted.
    """
    try:
        with zipfile.ZipFile(zip_file_path, 'r') as zf:
            if not zf.infolist():
                print(f"Error: The zip file '{zip_file_path}' is empty.")
                return None # Error state
                
            # Check the encryption flag for each file
            for info in zf.infolist():
                # The 1st bit (0x1) of flag_bits indicates encryption
                if (info.flag_bits & 0x1):
                    return True  # Found an encrypted file
            
            # If no file has the encryption flag, it's not password-protected
            return False
            
    except zipfile.BadZipFile:
        print(f"Error: '{zip_file_path}' is not a valid zip file or is corrupt.")
        return None
    except FileNotFoundError:
        print(f"Error: File not found at '{zip_file_path}'.")
        return None

def test_zip_password(zip_file_path, password_to_test):
    """
    Attempts to read a zip file with a given password.
    Returns True if correct, False if incorrect.
    """
    try:
        password_bytes = password_to_test.encode('utf-8')
        
        with zipfile.ZipFile(zip_file_path, 'r') as zf:
            zf.setpassword(password_bytes)
            
            # Try to read the first file. This will raise a
            # 'RuntimeError: Bad password' if the password is wrong.
            first_file_name = zf.infolist()[0].filename
            zf.read(first_file_name)

        # If .read() succeeds, the password was correct
        return True
        
    except RuntimeError:
        return False  # Password was incorrect (or other runtime issue)
    except Exception:
        return False  # Catch any other errors


# --- Main Script ---

# 1. SET YOUR FILENAME HERE
zip_file_name = 'bb.zip'

# --- NEW STEP: Check for encryption first ---
print(f"Checking if '{zip_file_name}' is encrypted...")
encrypted_status = check_if_encrypted(zip_file_name)

if encrypted_status is False:
    print("\n--- ERROR ---")
    print(f"The file '{zip_file_name}' is NOT password-protected.")
    print("You can open it normally without any script.")
    sys.exit()
elif encrypted_status is None:
    # An error was already printed by the check_if_encrypted function
    sys.exit()
else:
    print(f"File is encrypted. Proceeding with attack.")


# 2. DEFINE YOUR CHARACTER SET AND LENGTH
characters_to_try = string.ascii_lowercase + string.digits  # e.g., 'abc...123...'
min_length = 1  # Start from 1
max_length = 6

# 3. Calculate total combinations
print(f"Using character set: {characters_to_try}")
total_combinations = 0
for length in range(min_length, max_length + 1):
    total_combinations += len(characters_to_try) ** length

print(f"Testing {total_combinations:,} total combinations (lengths {min_length} to {max_length}).")
if input("Do you wish to continue? (y/n): ").lower() != 'y':
    print("Exiting.")
    sys.exit()

# 4. Start the brute-force attack
try:
    with tqdm(total=total_combinations, desc="Cracking", unit=" pass") as pbar:
        for length in range(min_length, max_length + 1):
            pbar.set_description(f"Trying length {length}")
            
            combinations = itertools.product(characters_to_try, repeat=length)
            
            for combo in combinations:
                password = "".join(combo)
                pbar.update(1)
                
                if test_zip_password(zip_file_name, password):
                    pbar.close()
                    print("\n" + "="*30)
                    print(f"✅ SUCCESS! Password found: {password}")
                    print("="*30)
                    sys.exit(0)
            
    print(f"\n❌ FAILED. Password not found within the specified settings.")

except KeyboardInterrupt:
    print("\nProcess stopped by user.")
