#!/usr/bin/env python3
"""
Test script to verify all imports used in the IISWPS project.
This will confirm that all required packages are installed.
"""

import sys
from typing import List, Tuple

def test_imports() -> List[Tuple[str, bool, str]]:
    """Test all imports used in the project."""
    results = []

    # Standard library imports (should always work)
    standard_libs = [
        "os", "sys", "random", "json", "asyncio",
        "datetime", "typing", "contextlib"
    ]

    # Third-party imports from requirements.txt
    third_party = [
        "fastapi", "uvicorn", "pydantic", "numpy",
        "sklearn", "joblib", "mysql.connector", "dotenv"
    ]

    # Specific sklearn submodules
    sklearn_modules = [
        "sklearn.neighbors",
        "sklearn.preprocessing",
        "sklearn.linear_model",
        "sklearn.cluster",
        "sklearn.ensemble"
    ]

    # Specific sklearn classes
    sklearn_classes = [
        ("sklearn.neighbors", "KNeighborsClassifier"),
        ("sklearn.preprocessing", "StandardScaler"),
        ("sklearn.linear_model", "LogisticRegression"),
        ("sklearn.cluster", "KMeans"),
        ("sklearn.ensemble", "RandomForestClassifier"),
        ("sklearn.ensemble", "VotingClassifier")
    ]

    print("=" * 70)
    print("TESTING ALL PROJECT IMPORTS")
    print("=" * 70)

    # Test standard library
    print("\n📚 Standard Library Imports:")
    for lib in standard_libs:
        try:
            __import__(lib)
            results.append((lib, True, "OK"))
            print(f"  ✓ {lib}")
        except ImportError as e:
            results.append((lib, False, str(e)))
            print(f"  ✗ {lib}: {e}")

    # Test third-party packages
    print("\n📦 Third-Party Packages:")
    for pkg in third_party:
        try:
            __import__(pkg)
            results.append((pkg, True, "OK"))
            print(f"  ✓ {pkg}")
        except ImportError as e:
            results.append((pkg, False, str(e)))
            print(f"  ✗ {pkg}: {e}")

    # Test sklearn submodules
    print("\n🔬 Scikit-learn Submodules:")
    for module in sklearn_modules:
        try:
            __import__(module)
            results.append((module, True, "OK"))
            print(f"  ✓ {module}")
        except ImportError as e:
            results.append((module, False, str(e)))
            print(f"  ✗ {module}: {e}")

    # Test specific sklearn classes
    print("\n🎯 Scikit-learn Classes:")
    for module, class_name in sklearn_classes:
        try:
            mod = __import__(module, fromlist=[class_name])
            getattr(mod, class_name)
            results.append((f"{module}.{class_name}", True, "OK"))
            print(f"  ✓ {module}.{class_name}")
        except (ImportError, AttributeError) as e:
            results.append((f"{module}.{class_name}", False, str(e)))
            print(f"  ✗ {module}.{class_name}: {e}")

    # Test FastAPI specific imports
    print("\n🚀 FastAPI Specific Imports:")
    fastapi_imports = [
        ("fastapi", "FastAPI"),
        ("fastapi", "HTTPException"),
        ("fastapi", "WebSocket"),
        ("fastapi", "WebSocketDisconnect"),
        ("fastapi.middleware.cors", "CORSMiddleware"),
        ("fastapi.responses", "JSONResponse")
    ]

    for module, class_name in fastapi_imports:
        try:
            mod = __import__(module, fromlist=[class_name])
            getattr(mod, class_name)
            results.append((f"{module}.{class_name}", True, "OK"))
            print(f"  ✓ {module}.{class_name}")
        except (ImportError, AttributeError) as e:
            results.append((f"{module}.{class_name}", False, str(e)))
            print(f"  ✗ {module}.{class_name}: {e}")

    return results

def print_summary(results: List[Tuple[str, bool, str]]):
    """Print summary of test results."""
    print("\n" + "=" * 70)
    print("SUMMARY")
    print("=" * 70)

    total = len(results)
    passed = sum(1 for _, success, _ in results if success)
    failed = total - passed

    print(f"\nTotal imports tested: {total}")
    print(f"✓ Passed: {passed}")
    print(f"✗ Failed: {failed}")

    if failed > 0:
        print("\n❌ Failed imports:")
        for name, success, error in results:
            if not success:
                print(f"  - {name}: {error}")
    else:
        print("\n✅ ALL IMPORTS SUCCESSFUL!")
        print("\nYour Python environment is correctly configured.")
        print("All required packages are installed and importable.")

    print("\n" + "=" * 70)
    print(f"Python version: {sys.version}")
    print(f"Python executable: {sys.executable}")
    print("=" * 70)

if __name__ == "__main__":
    results = test_imports()
    print_summary(results)

    # Exit with error code if any imports failed
    failed = sum(1 for _, success, _ in results if not success)
    sys.exit(1 if failed > 0 else 0)
