package com.fefacio.demo.model.request;

public class PMedianRequest {
    private String algorithm;
    private Integer p;
    private boolean useDemand;
    private boolean useRandomInitialization;

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public Integer getP() { return p; }
    public void setP(Integer p) { this.p = p; }

    public boolean getUseDemand() { return useDemand; }
    public void setUseDemand(boolean useDemand) { this.useDemand = useDemand; }

    public boolean getUseRandomInitialization() { return useRandomInitialization; }
    public void setUseRandomInitialization(boolean useRandomInitialization) { this.useRandomInitialization = useRandomInitialization;}
}
