package bime543;

import gov.nih.nlm.nls.metamap.lite.types.Entity;
import java.util.ArrayList;
import java.util.List;

public class ParserOutput {
    private List<Entity> entities = new ArrayList<Entity>();
    private String text;

    public ParserOutput() {}
    public ParserOutput(List<Entity> entities, String text) {
        this.entities = entities;
        this.text = text;
    }

    public List<Entity> getEntities() {
        return this.entities;
    }

    public void setEntities(List<Entity> entities) {
        this.entities = entities;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }
}

