package bime543;

import bioc.BioCDocument;
import gov.nih.nlm.nls.metamap.document.FreeText;
import gov.nih.nlm.nls.metamap.lite.types.Entity;
import gov.nih.nlm.nls.ner.MetaMapLite;
import java.util.List;
import java.util.Properties;

public class MetaMapLiteParser {

    Properties myProperties;
    MetaMapLite metaMapLiteInst;

    public MetaMapLiteParser(String mmLiteDataDirectory) {
        try {
            myProperties = new Properties();
            MetaMapLite.expandModelsDir(myProperties,
                    mmLiteDataDirectory + "/data/models");
            MetaMapLite.expandIndexDir(myProperties,
                    mmLiteDataDirectory + "/data/ivf/strict");
            myProperties.setProperty("metamaplite.excluded.termsfile",
                    mmLiteDataDirectory + "/data/specialterms.txt");

            metaMapLiteInst = new MetaMapLite(myProperties);

        } catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    public List<Entity> parseSentence(String text) throws Exception {
        BioCDocument document = FreeText.instantiateBioCDocument(text);
        document.setID("1");
        return metaMapLiteInst.processDocument(document);
    }
}
