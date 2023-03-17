import * as cdk from 'aws-cdk-lib';
import { IpAddresses, Peer, Port, SecurityGroup, Subnet, SubnetType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { AppProtocol, Cluster, ContainerImage, FargateService, FargateTaskDefinition, ListenerConfig, Protocol, TaskDefinition } from 'aws-cdk-lib/aws-ecs';
import { ApplicationListener, ApplicationLoadBalancer, ApplicationProtocol, ListenerAction, ListenerCondition } from 'aws-cdk-lib/aws-elasticloadbalancingv2';


export class CdkWorkshopStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // get a VPC by ID
    const myvpc = Vpc.fromLookup(this, "vpc-0803355579cde85c4", {
      vpcId: "vpc-0803355579cde85c4",
      isDefault: true
    });


    // create a custom VPC
    /* const myvpc = new Vpc(this, 'vpc101', {
      ipAddresses: IpAddresses.cidr("172.20.0.0/16"),
      vpcName: "vpc_cdk",
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "public-subnet",
          subnetType: SubnetType.PUBLIC,
        },
      ],
      maxAzs: 2
    });
 */
    // create a cluster
    const myCluster = new Cluster(this, "ClusterCDK", {
      clusterName: "ClusterCDK",
      vpc: myvpc,
    });

    //create a task definition
    const taskDef = new FargateTaskDefinition(this, "MicroOneTaskDef", {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    const containerDef = taskDef.addContainer("micro1", {
      image: ContainerImage.fromRegistry("mohamednebbai/micro1", {
      }),
      containerName: "micro1",
      portMappings: [
        {
          containerPort: 80,
          protocol: Protocol.TCP,
        }
      ]
    });

    //create a security group for service
    const serviceSG = new SecurityGroup(this, 'FargateServiceSG', {
      vpc: myvpc,
      securityGroupName: "FargateServiceSG"
    });
    serviceSG.addIngressRule(Peer.anyIpv4(), Port.tcp(80));
    serviceSG.addEgressRule(Peer.anyIpv4(), Port.allTraffic());

    // create a fargate service
    const fargateService = new FargateService(this, "service101", {
      cluster: myCluster,
      taskDefinition: taskDef,
      desiredCount: 1,
      serviceName: "Micro1Service",
      assignPublicIp: true,
      securityGroups: [serviceSG]
    });


    // create an internet (public) alb
    const Alb = new ApplicationLoadBalancer(this, 'PublicAlb', {
      vpc: myvpc,
      internetFacing: true,
      securityGroup: serviceSG,
    });

    const listener = new ApplicationListener(this, 'Listener', {
      loadBalancer: Alb,
      port: 80,
    });

    fargateService.registerLoadBalancerTargets(
      {
        containerName: containerDef.containerName,
        containerPort: 80,
        newTargetGroupId: 'target group 1',
        listener: ListenerConfig.applicationListener(listener),
      },
    );
  }
}



