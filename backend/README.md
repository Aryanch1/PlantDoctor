# PlantDoctor backend

Spring Boot 3.3.5 (Java 17) service that diagnoses plant problems. Endpoints:

- `POST /api/diagnose` — `{ "description": "...", "plantType": "Monstera", "photoNote": "..." }` →
  `{ "diagnosis": { plantType, symptomText, hasPhoto, likelyCause, severity,
  careSteps, watering, light, source, ... } }`.
- `GET /api/plants` — the curated care library (6 plants).
- `GET /api/health` — `{ "status": "ok", "app": "plantdoctor" }`.

## Live vs demo

- **Live** (`source: "live"`): when `GEMINI_API_KEY` is set, the request
  goes to Google Gemini (`gemini-3.5-flash-lite`) through the
  OpenAI-compatible endpoint
  `https://generativelanguage.googleapis.com/v1beta/openai/`.
  The key comes from the environment only — never from code or the repo.
  Optional overrides: `PLANTDOCTOR_GEMINI_MODEL`,
  `PLANTDOCTOR_GEMINI_BASE_URL` (also see `application.properties`).
- **Demo** (`source: "demo"`): when no key is set, or the AI call fails,
  the endpoint still answers with a built-in demo diagnosis (keyword
  rules over the symptoms, same as the app's on-device library).
  The app always says which mode the answer came from.

## Run

```sh
cd backend
./mvnw spring-boot:run        # serves on http://localhost:8080
```

On a normal machine `./mvnw test` and `./mvnw package` just work: the
wrapper downloads Maven 3.9.9 and all dependencies from Maven Central.

## Tests

```sh
./mvnw test   # 13 tests: SymptomParser (7), DiagnoseController (5), context load (1)
```

`PlantDoctorApplicationTests` boots the whole context with no API key set,
so a wiring mistake (e.g. an ambiguous `GeminiClient` constructor) fails
the suite instead of failing at first real boot.

## Offline build in this sandbox

This VM blocks all TCP from Java processes, so plain `mvn` cannot reach
Maven Central — even through the egress proxy, and even to localhost.
Dependencies are therefore resolved by a Python helper that downloads
them with `curl` (which does go through the proxy) into the local repo:

```sh
python3 ~/tools/mvn-resolve.py backend/pom.xml \
  commons-io:commons-io:2.15.1 \
  org.apache.maven.surefire:surefire-junit-platform:3.2.5 \
  org.junit.platform:junit-platform-launcher:1.10.5 \
  org.apache.maven.plugins:maven-wrapper-plugin:3.2.0 \
  org.apache.maven.plugins:maven-jar-plugin:3.4.2 \
  org.tomlj:tomlj:1.0.0 \
  org.apache.maven.plugins:maven-shade-plugin:3.5.0
./mvnw -o test
```

The extra roots are artifacts Maven resolves at runtime rather than from
a POM edge: the Surefire JUnit Platform provider + launcher, the
Maven-core 3.9.9 transitive `commons-io`, the wrapper/jar plugins, and
the `repackage` goal's `tomlj` + `maven-shade-plugin`. The resolver
applies the nearest dependencyManagement per tree (app BOM first, then
each plugin's own), inherits parent `<dependencies>`, and skips
test-scoped transitive deps. On a normal machine none of this is needed.

Two environment notes:

- The wrapper needs its Maven distribution zip pre-seeded here, because
  the Java downloader cannot use the network:
  `~/.m2/wrapper/dists/apache-maven-3.9.9-bin/<hash>/apache-maven-3.9.9-bin.zip`.
  On a normal machine the wrapper downloads it on first run.
- `/root/.m2` is a symlink to `/home/hatch/.m2`, so Maven (running as
  root) uses the same local repository as the resolver.
