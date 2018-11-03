package bime543;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.io.File;
import java.util.Arrays;
import java.util.stream.Collectors;
import com.fasterxml.jackson.databind.ObjectMapper;

public class Main {

    public static void main(String[] args) {

        String mmLiteDataDirectory = "C:/NicWork/apps/metamaplite/public_mm_lite";
        String textPath = "C:/NicWork/data/bime543/insulin.txt";
        String outPath = "C:/NicWork/data/bime543/metamapoutput.json";
        var output = new ArrayList<ParserOutput>();
        var mapper = new ObjectMapper();

        try {
            var parser = new MetaMapLiteParser(mmLiteDataDirectory);

            // Get raw file text
            byte[] encoded = Files.readAllBytes(Paths.get(textPath));
            String content = new String(encoded, StandardCharsets.UTF_8);

            // Split to individual posts by newline
            var posts = new ArrayList<String>(Arrays.asList(content.split("[\\r\\n]+")));

            // Limit to first 30 posts
            var postsLim = posts.stream().limit(30).collect(Collectors.toList());

            // Parse each post
            for (String post : postsLim) {

                // Extract concepts
                var concepts = parser.parseSentence(post);

                output.add(new ParserOutput(concepts, post));
            }

            // Output to JSON
            mapper.writeValue(new File(outPath), output);
        }
        catch(Exception e) {
            e.printStackTrace();
        }

    }
}
